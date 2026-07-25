const fs = require('fs');
const path = require('path');
const Store = require('./store');

// Mock fs to avoid writing to actual filesystem during tests
jest.mock('fs');

describe('Store', () => {
    let store;
    const testDataPath = path.join(__dirname, 'test-data');

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Mock fs implementations
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
        fs.writeFileSync.mockImplementation(() => {});
        fs.renameSync.mockImplementation(() => {});

        store = new Store(testDataPath);
    });

    describe('updateDigraphMetrics', () => {
        const keyFrom = 'a';
        const keyTo = 'b';
        const digraphKey = `${keyFrom}:${keyTo}`;

        it('should create new digraph metric if it does not exist', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 500, false);

            expect(store.data.digraph_metrics[digraphKey]).toBeDefined();
            expect(store.data.digraph_metrics[digraphKey].transition_count).toBe(1);
            expect(store.data.digraph_metrics[digraphKey].total_transition_ms).toBe(500);
            expect(store.data.digraph_metrics[digraphKey].error_count).toBe(0);
        });

        it('should increment transition_count and total_transition_ms for valid transitionMs (0 < ms < 3000)', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 1500, false);
            store.updateDigraphMetrics(keyFrom, keyTo, 1000, false);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(2);
            expect(metric.total_transition_ms).toBe(2500); // 1500 + 1000
        });

        it('should not increment total_transition_ms if transitionMs is 3000 (upper bound)', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 3000, false);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(1);
            expect(metric.total_transition_ms).toBe(0);
        });

        it('should not increment total_transition_ms if transitionMs is > 3000', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 3500, false);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(1);
            expect(metric.total_transition_ms).toBe(0);
        });

        it('should not increment total_transition_ms if transitionMs is 0 (lower bound)', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 0, false);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(1);
            expect(metric.total_transition_ms).toBe(0);
        });

        it('should not increment total_transition_ms if transitionMs is < 0', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, -100, false);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(1);
            expect(metric.total_transition_ms).toBe(0);
        });

        it('should increment error_count when isError is true', () => {
            store.updateDigraphMetrics(keyFrom, keyTo, 500, true);
            store.updateDigraphMetrics(keyFrom, keyTo, 600, false);
            store.updateDigraphMetrics(keyFrom, keyTo, 3500, true);

            const metric = store.data.digraph_metrics[digraphKey];
            expect(metric.transition_count).toBe(3);
            expect(metric.error_count).toBe(2);
            expect(metric.total_transition_ms).toBe(1100); // 500 + 600 (3500 is excluded)
        });
    });
});