const MetricsEngine = require('./metrics');

describe('MetricsEngine', () => {
    let metricsEngine;

    beforeEach(() => {
        // Mock store
        const mockStore = {
            addSession: jest.fn(),
            saveMetrics: jest.fn(),
            flushMetrics: jest.fn()
        };
        metricsEngine = new MetricsEngine(mockStore);
    });

    afterEach(() => {
        metricsEngine.destroy();
    });

    const createMockSession = (start_time) => ({
        start_time,
        end_time: start_time,
        app_name: 'test',
        app_category: 'test',
        keystroke_count: 0,
        backspace_count: 0,
        active_typing_seconds: 0,
        word_count: 0,
        avg_wpm: 0,
        max_wpm: 0,
        burst_wpms: []
    });

    describe('getSessionDurationStr', () => {
        it('should return "00:00" when there is no current session', () => {
            const now = Date.now();
            metricsEngine.currentSession = null;

            expect(metricsEngine.getSessionDurationStr(now)).toBe("00:00");
        });

        it('should format seconds correctly under a minute', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 45 seconds later
            const now = start_time + 45000;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("00:45");
        });

        it('should format single digit seconds with a leading zero', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 5 seconds later
            const now = start_time + 5000;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("00:05");
        });

        it('should format exact minutes correctly', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 3 minutes exactly (180 seconds)
            const now = start_time + 180000;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("03:00");
        });

        it('should format minutes and seconds correctly', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 12 minutes and 34 seconds (754 seconds)
            const now = start_time + 754000;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("12:34");
        });

        it('should continue to format correctly when duration exceeds 60 minutes', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 90 minutes and 15 seconds (5415 seconds)
            const now = start_time + 5415000;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("90:15");
        });

        it('should handle zero duration correctly', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 0 seconds elapsed
            const now = start_time;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("00:00");
        });

        it('should handle fractional seconds gracefully by flooring', () => {
            const start_time = 1000000;
            metricsEngine.currentSession = createMockSession(start_time);

            // 1 minute, 2 seconds, 999 milliseconds
            const now = start_time + 62999;
            expect(metricsEngine.getSessionDurationStr(now)).toBe("01:02");
        });
    });
});
