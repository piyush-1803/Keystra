const MetricsEngine = require('./metrics');

describe('MetricsEngine - processEvent inactivity timeout', () => {
    let engine;
    let mockStore;

    beforeEach(() => {
        // Mock the store dependency
        mockStore = {
            saveMetrics: jest.fn(),
            addSession: jest.fn()
        };

        engine = new MetricsEngine(mockStore);
        // We want to test processEvent, so let's mock closeSession to easily verify if it was called
        jest.spyOn(engine, 'closeSession');
    });

    afterEach(() => {
        engine.destroy();
        jest.restoreAllMocks();
    });

    it('should call closeSession if currentSession exists and inactivity exceeds sessionTimeoutMs', () => {
        // Setup an initial state with an active session
        engine.currentSession = {
            id: 'dummy-session',
            burst_wpms: [],
            keystroke_count: 0
        }; // Mock session with required fields for evaluateBurst/closeSession
        engine.lastKeystrokeTime = 1000;
        engine.sessionTimeoutMs = 30000;

        // Create an event that is 30001ms after the last keystroke (exceeds timeout)
        const event = { timestamp: 31001, event: 'keydown', process: 'test.exe', window: 'test', keyName: 'A', vkCode: 65 };

        engine.processEvent(event);

        expect(engine.closeSession).toHaveBeenCalled();
    });

    it('should NOT call closeSession if inactivity does not exceed sessionTimeoutMs', () => {
        engine.currentSession = {
            id: 'dummy-session',
            app_name: 'test',
            burst_wpms: [],
            keystroke_count: 0
        }; // app_name must match event.process without .exe to avoid closing due to app switch
        engine.lastKeystrokeTime = 1000;
        engine.sessionTimeoutMs = 30000;

        // Exactly at timeout boundary (30000ms difference), should not close
        const event1 = { timestamp: 31000, event: 'keydown', process: 'test.exe', window: 'test', keyName: 'A', vkCode: 65 };
        engine.processEvent(event1);
        expect(engine.closeSession).not.toHaveBeenCalled();

        // Below timeout boundary
        const event2 = { timestamp: 20000, event: 'keydown', process: 'test.exe', window: 'test', keyName: 'B', vkCode: 66 };
        engine.processEvent(event2);
        expect(engine.closeSession).not.toHaveBeenCalled();
    });

    it('should NOT call closeSession if there is no currentSession', () => {
        engine.currentSession = null;
        engine.lastKeystrokeTime = 1000;
        engine.sessionTimeoutMs = 30000;

        // Event timestamp far in the future
        const event = { timestamp: 99999, event: 'keydown', process: 'test.exe', window: 'test', keyName: 'A', vkCode: 65 };

        engine.processEvent(event);

        expect(engine.closeSession).not.toHaveBeenCalled();
    });
});
