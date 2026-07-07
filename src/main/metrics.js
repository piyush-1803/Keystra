const Store = require('./store');

class MetricsEngine {
    constructor(store) {
        this.store = store;

        // Current active session tracking
        this.currentSession = null;
        this.sessionTimeoutMs = 30000; // 30 seconds of inactivity closes a session

        // Current typing burst tracking (for WPM calculations)
        this.burstKeysCount = 0;
        this.burstStartTime = 0;
        this.lastKeystrokeTime = 0;
        this.burstTimeoutMs = 2500; // 2.5 seconds pause ends a burst

        // Key down state tracker for calculating key hold latencies (keydown -> keyup)
        this.keyDownTimes = {}; // keyCode -> timestamp

        // Digraph tracking (previous key details for calculating transition speed)
        this.lastKeyVal = null; // { keyCode, timestamp }

        // In-memory stats accumulation (flushed to database periodically)
        this.accumulatedKeys = {}; // keyCode -> { name, latencySum, count }
        this.accumulatedDigraphs = {}; // "keyFrom:keyTo" -> { transitionSum, count, errorCount }
        this.flushInterval = null;

        // Start periodic database flush for metrics
        this.startFlusher();
    }

    startFlusher() {
        // Flush in-memory accumulated metrics to the JSON store every 10 seconds
        this.flushInterval = setInterval(() => {
            this.flushMetrics();
        }, 10000);
    }

    flushMetrics() {
        if (Object.keys(this.accumulatedKeys).length === 0 && Object.keys(this.accumulatedDigraphs).length === 0) {
            return;
        }
        this.store.saveMetrics(this.accumulatedKeys, this.accumulatedDigraphs);
        this.accumulatedKeys = {};
        this.accumulatedDigraphs = {};
    }

    // Categorize windows based on process names and window titles
    categorizeApp(processName, windowTitle) {
        const proc = processName.toLowerCase();
        const title = windowTitle.toLowerCase();

        // 1. Coding (IDEs, text editors, terminals)
        if (proc.includes('code') || proc.includes('idea') || proc.includes('sublime') || 
            proc.includes('notepad++') || proc.includes('eclipse') || proc.includes('devenv') || 
            proc.includes('terminal') || proc.includes('powershell') || proc.includes('cmd.exe') || 
            proc.includes('bash') || proc.includes('git-bash') || title.includes('vs code') || 
            title.includes('visual studio')) {
            return 'Coding';
        }

        // 2. Chatting (Messengers)
        if (proc.includes('slack') || proc.includes('discord') || proc.includes('teams') || 
            proc.includes('whatsapp') || proc.includes('messenger') || proc.includes('skype') || 
            proc.includes('telegram')) {
            return 'Chatting';
        }

        // 3. Writing (Word processors, note taking tools)
        if (proc.includes('word') || proc.includes('notion') || proc.includes('obsidian') || 
            proc.includes('onenote') || proc.includes('notepad') || proc.includes('writer') || 
            proc.includes('evernote') || title.includes('google docs') || title.includes('google sheets')) {
            return 'Writing';
        }

        // 4. Web Browsing
        if (proc.includes('chrome') || proc.includes('firefox') || proc.includes('msedge') || 
            proc.includes('opera') || proc.includes('brave') || proc.includes('safari')) {
            return 'Browsing';
        }

        return 'Other';
    }

    processEvent(event, onMetricUpdate) {
        const now = event.timestamp;

        // Check if inactive for too long, close session if so
        if (this.currentSession && (now - this.lastKeystrokeTime > this.sessionTimeoutMs)) {
            this.closeSession();
        }

        if (event.event === 'keydown') {
            this.handleKeyDown(event, now);
        } else if (event.event === 'keyup') {
            this.handleKeyUp(event, now);
        }

        this.lastKeystrokeTime = now;

        // Trigger IPC update callback for real-time frontend displays
        if (onMetricUpdate && this.currentSession) {
            onMetricUpdate({
                currentWpm: this.calculateCurrentWpm(now),
                accuracy: this.calculateSessionAccuracy(),
                sessionTimeStr: this.getSessionDurationStr(now),
                activeApp: this.currentSession.app_name,
                category: this.currentSession.app_category
            });
        }
    }

    handleKeyDown(event, now) {
        const appName = event.process.replace('.exe', '');
        const appCategory = this.categorizeApp(event.process, event.window);

        // 1. Session Lifecycle management
        if (!this.currentSession) {
            this.currentSession = {
                start_time: now,
                end_time: now,
                app_name: appName,
                app_category: appCategory,
                keystroke_count: 0,
                backspace_count: 0,
                active_typing_seconds: 0,
                word_count: 0,
                avg_wpm: 0,
                max_wpm: 0,
                burst_wpms: []
            };
            this.resetBurst(now);
        } else if (this.currentSession.app_name !== appName) {
            // App focus switched, close old session and start a new one
            this.closeSession();
            this.currentSession = {
                start_time: now,
                end_time: now,
                app_name: appName,
                app_category: appCategory,
                keystroke_count: 0,
                backspace_count: 0,
                active_typing_seconds: 0,
                word_count: 0,
                avg_wpm: 0,
                max_wpm: 0,
                burst_wpms: []
            };
            this.resetBurst(now);
        }

        // Record keydown timestamp for hold-latency tracking
        this.keyDownTimes[event.vkCode] = now;

        // Track stats
        this.currentSession.keystroke_count += 1;
        this.currentSession.end_time = now;

        const isBackspace = (event.keyName === 'Backspace' || event.keyName === 'Delete');
        if (isBackspace) {
            this.currentSession.backspace_count += 1;
        }

        // 2. Typing Burst & WPM calculation
        if (this.burstKeysCount === 0) {
            this.burstStartTime = now;
        }

        const elapsedSinceLastKey = now - this.lastKeystrokeTime;
        if (elapsedSinceLastKey > this.burstTimeoutMs && this.burstKeysCount > 0) {
            // End active burst, push its metrics, and start a new one
            this.evaluateBurst(now);
            this.resetBurst(now);
        }

        this.burstKeysCount += 1;

        // 3. Digraph Latency tracking (excluding sensitive context masks)
        if (event.keyName !== '[MASKED]') {
            if (this.lastKeyVal && (now - this.lastKeyVal.timestamp < this.burstTimeoutMs)) {
                const keyPair = `${this.lastKeyVal.keyCode}:${event.vkCode}`;
                const transitionMs = now - this.lastKeyVal.timestamp;
                
                if (!this.accumulatedDigraphs[keyPair]) {
                    this.accumulatedDigraphs[keyPair] = { transitionSum: 0, count: 0, errorCount: 0 };
                }
                const digraph = this.accumulatedDigraphs[keyPair];
                digraph.transitionSum += transitionMs;
                digraph.count += 1;
                if (isBackspace) {
                    digraph.errorCount += 1;
                }
            }
            this.lastKeyVal = { keyCode: event.vkCode, timestamp: now };
        } else {
            this.lastKeyVal = null;
        }
    }

    handleKeyUp(event, now) {
        const downTime = this.keyDownTimes[event.vkCode];
        if (downTime) {
            const latencyMs = now - downTime;
            delete this.keyDownTimes[event.vkCode];

            // Only log alphanumeric keyboard latency metrics in non-masked fields
            if (event.keyName !== '[MASKED]') {
                const code = event.vkCode;
                if (!this.accumulatedKeys[code]) {
                    this.accumulatedKeys[code] = { name: event.keyName, latencySum: 0, count: 0 };
                }
                const keyStat = this.accumulatedKeys[code];
                keyStat.latencySum += latencyMs;
                keyStat.count += 1;
            }
        }
    }

    resetBurst(now) {
        this.burstKeysCount = 1;
        this.burstStartTime = now;
    }

    evaluateBurst(now) {
        const durationSeconds = (this.lastKeystrokeTime - this.burstStartTime) / 1000;
        
        // Only evaluate WPM for bursts of reasonable length (>= 4 keys) to filter out calculation jitter
        if (durationSeconds > 0.5 && this.burstKeysCount >= 4) {
            const words = this.burstKeysCount / 5;
            const wpm = Math.round(words / (durationSeconds / 60));
            
            if (wpm > 10 && wpm < 300) { // Keep WPM inside biological bounds
                this.currentSession.burst_wpms.push(wpm);
                if (wpm > this.currentSession.max_wpm) {
                    this.currentSession.max_wpm = wpm;
                }
                
                this.currentSession.active_typing_seconds += durationSeconds;
                this.currentSession.word_count += Math.round(this.burstKeysCount / 5);
            }
        }
    }

    calculateCurrentWpm(now) {
        // Calculate WPM in real-time for the floating overlay display
        const durationSec = (now - this.burstStartTime) / 1000;
        if (durationSec > 0.5 && this.burstKeysCount >= 3) {
            return Math.round((this.burstKeysCount / 5) / (durationSec / 60));
        }
        // Fallback: return the average of the current session or 0
        if (this.currentSession && this.currentSession.burst_wpms.length > 0) {
            return this.currentSession.burst_wpms[this.currentSession.burst_wpms.length - 1];
        }
        return 0;
    }

    calculateSessionAccuracy() {
        if (!this.currentSession || this.currentSession.keystroke_count === 0) return 100;
        
        const keys = this.currentSession.keystroke_count;
        const errors = this.currentSession.backspace_count;
        
        // Standard typing accuracy estimation: double the penalty of backspaces
        // (one error keystroke + one backspace correction keystroke)
        const acc = ((keys - (errors * 2)) / keys) * 100;
        return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
    }

    getSessionDurationStr(now) {
        if (!this.currentSession) return "00:00";
        const totalSec = Math.floor((now - this.currentSession.start_time) / 1000);
        const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const secs = (totalSec % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    closeSession() {
        if (!this.currentSession) return;

        // Finalize the last pending typing burst
        this.evaluateBurst(this.lastKeystrokeTime);

        const session = this.currentSession;
        
        // Calculate average WPM across all bursts in the session
        if (session.burst_wpms.length > 0) {
            const sum = session.burst_wpms.reduce((a, b) => a + b, 0);
            session.avg_wpm = Math.round(sum / session.burst_wpms.length);
        } else {
            // Short burst sessions
            const durationMin = (session.end_time - session.start_time) / 60000;
            if (durationMin > 0.05 && session.keystroke_count >= 5) {
                session.avg_wpm = Math.round((session.keystroke_count / 5) / durationMin);
                session.max_wpm = session.avg_wpm;
            }
        }

        // Clean up temporary arrays before saving to keep JSON files tiny
        delete session.burst_wpms;

        // Only log sessions that represent actual typing activity (at least 4 keystrokes)
        if (session.keystroke_count >= 4) {
            this.store.addSession(session);
        }

        this.currentSession = null;
        this.burstKeysCount = 0;
        this.keyDownTimes = {};
        this.lastKeyVal = null;
    }

    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.closeSession();
        this.flushMetrics();
    }
}

module.exports = MetricsEngine;
