const MetricsEngine = require('./metrics');

describe('MetricsEngine', () => {
    let engine;
    let mockStore;

    beforeEach(() => {
        mockStore = {
            saveMetrics: jest.fn(),
            addSession: jest.fn()
        };
        engine = new MetricsEngine(mockStore);
        // Stop the flusher interval so tests don't hang
        if (engine.flushInterval) {
            clearInterval(engine.flushInterval);
            engine.flushInterval = null;
        }

        // Initialize a mock session for the engine
        engine.currentSession = {
            burst_wpms: [],
            max_wpm: 0,
            active_typing_seconds: 0,
            word_count: 0
        };
    });

    afterEach(() => {
        engine.destroy();
    });

    describe('evaluateBurst bounds filtering', () => {
        it('should process a valid burst within all bounds', () => {
            // duration = 1 second
            engine.burstStartTime = 1000;
            engine.lastKeystrokeTime = 2000;
            // 10 keys = 2 words. 2 words in 1 second = 120 WPM.
            engine.burstKeysCount = 10;

            engine.evaluateBurst(2000);

            expect(engine.currentSession.burst_wpms).toContain(120);
            expect(engine.currentSession.max_wpm).toBe(120);
            expect(engine.currentSession.active_typing_seconds).toBe(1);
            expect(engine.currentSession.word_count).toBe(2);
        });

        it('should ignore burst if duration is 0.5 seconds or less', () => {
            // duration = 0.5 seconds
            engine.burstStartTime = 1000;
            engine.lastKeystrokeTime = 1500;
            engine.burstKeysCount = 10;

            engine.evaluateBurst(1500);

            expect(engine.currentSession.burst_wpms.length).toBe(0);
            expect(engine.currentSession.max_wpm).toBe(0);
            expect(engine.currentSession.active_typing_seconds).toBe(0);
            expect(engine.currentSession.word_count).toBe(0);
        });

        it('should ignore burst if burstKeysCount is less than 4', () => {
            // duration = 1 second
            engine.burstStartTime = 1000;
            engine.lastKeystrokeTime = 2000;
            engine.burstKeysCount = 3; // less than 4

            engine.evaluateBurst(2000);

            expect(engine.currentSession.burst_wpms.length).toBe(0);
            expect(engine.currentSession.max_wpm).toBe(0);
            expect(engine.currentSession.active_typing_seconds).toBe(0);
            expect(engine.currentSession.word_count).toBe(0);
        });

        it('should ignore burst if WPM is 10 or less', () => {
            // duration = 12 seconds
            engine.burstStartTime = 1000;
            engine.lastKeystrokeTime = 13000;
            // 5 keys = 1 word. 1 word in 12 seconds = 5 WPM
            engine.burstKeysCount = 5;

            engine.evaluateBurst(13000);

            expect(engine.currentSession.burst_wpms.length).toBe(0);
            expect(engine.currentSession.max_wpm).toBe(0);
            expect(engine.currentSession.active_typing_seconds).toBe(0);
            expect(engine.currentSession.word_count).toBe(0);
        });

        it('should ignore burst if WPM is 300 or more', () => {
            // duration = 1 second
            engine.burstStartTime = 1000;
            engine.lastKeystrokeTime = 2000;
            // 50 keys = 10 words. 10 words in 1 second = 600 WPM
            engine.burstKeysCount = 50;

            engine.evaluateBurst(2000);

            expect(engine.currentSession.burst_wpms.length).toBe(0);
            expect(engine.currentSession.max_wpm).toBe(0);
            expect(engine.currentSession.active_typing_seconds).toBe(0);
            expect(engine.currentSession.word_count).toBe(0);
        });
    });
});
