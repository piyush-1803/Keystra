const MetricsEngine = require('./metrics');

describe('MetricsEngine - calculateSessionAccuracy', () => {
    let metrics;
    let mockStore;

    beforeEach(() => {
        mockStore = {
            saveMetrics: jest.fn(),
            addSession: jest.fn()
        };
        metrics = new MetricsEngine(mockStore);
    });

    afterEach(() => {
        metrics.destroy();
    });

    test('returns 100 when there is no active session', () => {
        metrics.currentSession = null;
        expect(metrics.calculateSessionAccuracy()).toBe(100);
    });

    test('returns 100 when keystroke_count is 0', () => {
        metrics.currentSession = {
            keystroke_count: 0,
            backspace_count: 0,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(100);
    });

    test('calculates accuracy properly with normal typing', () => {
        // 100 keystrokes, 5 backspaces.
        // Penalty = 5 * 2 = 10
        // Correct = 100 - 10 = 90
        // Accuracy = 90%
        metrics.currentSession = {
            keystroke_count: 100,
            backspace_count: 5,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(90);
    });

    test('calculates 100% accuracy when there are no errors', () => {
        metrics.currentSession = {
            keystroke_count: 50,
            backspace_count: 0,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(100);
    });

    test('clamps accuracy to 0% if errors are too high', () => {
        // 10 keystrokes, 10 backspaces.
        // Penalty = 10 * 2 = 20
        // Correct = 10 - 20 = -10
        // Accuracy should clamp to 0 instead of being negative.
        metrics.currentSession = {
            keystroke_count: 10,
            backspace_count: 10,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(0);
    });

    test('rounds the accuracy to 1 decimal place properly', () => {
        // 33 keystrokes, 1 backspace.
        // Penalty = 2
        // Correct = 31
        // Accuracy = (31 / 33) * 100 = 93.939393...
        // Expected rounding to 93.9
        metrics.currentSession = {
            keystroke_count: 33,
            backspace_count: 1,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(93.9);

        // 3 keystrokes, 1 backspace
        // Penalty = 2
        // Correct = 1
        // Accuracy = 33.3333... -> 33.3
        metrics.currentSession = {
            keystroke_count: 3,
            backspace_count: 1,
            burst_wpms: []
        };
        expect(metrics.calculateSessionAccuracy()).toBe(33.3);
    });
});
