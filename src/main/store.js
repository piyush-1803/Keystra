const fs = require('fs');
const path = require('path');

class Store {
    constructor(userDataPath) {
        this.dirPath = userDataPath;
        this.filePath = path.join(this.dirPath, 'data.json');
        
        // Initialize empty state structure
        this.data = {
            onboardingCompleted: false,
            sessions: [],
            key_metrics: {},      // key_code -> { key_name, total_presses, accumulated_latency_ms }
            digraph_metrics: {},  // "key_from:key_to" -> { transition_count, total_transition_ms, error_count }
            streaks: {
                currentStreak: 0,
                lastActiveDate: null,
                dailyKeys: {}     // YYYY-MM-DD -> keyCount
            }
        };

        this.init();
    }

    setOnboardingComplete() {
        this.data.onboardingCompleted = true;
        this.save();
    }

    isOnboardingComplete() {
        return !!this.data.onboardingCompleted;
    }

    init() {
        try {
            // Create user data folder if it doesn't exist
            if (!fs.existsSync(this.dirPath)) {
                fs.mkdirSync(this.dirPath, { recursive: true });
            }

            // Load existing file if present
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                const parsed = JSON.parse(raw);
                this.data = { ...this.data, ...parsed };
            } else {
                this.save();
            }
        } catch (e) {
            console.error('Failed to load Keystra store:', e);
        }
    }

    save() {
        try {
            // Atomic write: write to temp file first, then rename
            const tempPath = this.filePath + '.tmp';
            fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
            fs.renameSync(tempPath, this.filePath);
        } catch (e) {
            console.error('Failed to save Keystra store:', e);
        }
    }

    // Sessions API
    addSession(session) {
        // Limit stored sessions list to 500 to keep JSON size lightweight
        this.data.sessions.push(session);
        if (this.data.sessions.length > 500) {
            this.data.sessions.shift();
        }
        
        // Update daily streak metrics
        const dateStr = new Date(session.start_time).toISOString().split('T')[0];
        if (!this.data.streaks.dailyKeys[dateStr]) {
            this.data.streaks.dailyKeys[dateStr] = 0;
        }
        this.data.streaks.dailyKeys[dateStr] += session.keystroke_count;

        this.updateStreak(dateStr);
        this.save();
    }

    updateStreak(todayStr) {
        const streaks = this.data.streaks;
        if (streaks.lastActiveDate === todayStr) return; // Already processed today

        if (streaks.lastActiveDate) {
            const lastDate = new Date(streaks.lastActiveDate);
            const todayDate = new Date(todayStr);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streaks.currentStreak += 1;
            } else if (diffDays > 1) {
                streaks.currentStreak = 1; // Streak broken, restart
            }
        } else {
            streaks.currentStreak = 1; // First time
        }

        streaks.lastActiveDate = todayStr;
    }

    getSessions() {
        return this.data.sessions;
    }

    // Key Latency & Usage Frequency API
    updateKeyMetrics(keyCode, keyName, latencyMs) {
        if (!this.data.key_metrics[keyCode]) {
            this.data.key_metrics[keyCode] = {
                key_name: keyName,
                total_presses: 0,
                accumulated_latency_ms: 0
            };
        }
        
        const metric = this.data.key_metrics[keyCode];
        metric.total_presses += 1;
        // Basic filter: only accumulate realistic key down-up latch times (< 1 second)
        if (latencyMs > 0 && latencyMs < 1000) {
            metric.accumulated_latency_ms += latencyMs;
        }
    }

    // Digraph Transition Speeds API
    updateDigraphMetrics(keyFrom, keyTo, transitionMs, isError) {
        const key = `${keyFrom}:${keyTo}`;
        if (!this.data.digraph_metrics[key]) {
            this.data.digraph_metrics[key] = {
                transition_count: 0,
                total_transition_ms: 0,
                error_count: 0
            };
        }

        const metric = this.data.digraph_metrics[key];
        metric.transition_count += 1;
        if (transitionMs > 0 && transitionMs < 3000) { // Limit transition to < 3 seconds
            metric.total_transition_ms += transitionMs;
        }
        if (isError) {
            metric.error_count += 1;
        }
    }

    saveMetrics(keyStats, digraphStats) {
        // Batch save key and digraph statistics to avoid high-frequency disk writes
        for (const [code, item] of Object.entries(keyStats)) {
            this.updateKeyMetrics(parseInt(code), item.name, item.latencySum);
        }

        for (const [pair, item] of Object.entries(digraphStats)) {
            const parts = pair.split(':');
            this.updateDigraphMetrics(parts[0], parts[1], item.transitionSum, item.errorCount);
        }

        this.save();
    }

    getStats() {
        return {
            sessions: this.data.sessions,
            keyMetrics: this.data.key_metrics,
            digraphMetrics: this.data.digraph_metrics,
            streaks: {
                currentStreak: this.data.streaks.currentStreak,
                dailyKeys: this.data.streaks.dailyKeys
            }
        };
    }
}

module.exports = Store;
