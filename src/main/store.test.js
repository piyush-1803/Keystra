const Store = require('./store');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Store key metrics latency filter bounds', () => {
    let store;
    let tempDir;

    beforeEach(() => {
        // Create a temporary directory for the store data to avoid writing to the real filesystem
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'keystra-test-'));
        store = new Store(tempDir);
    });

    afterEach(() => {
        // Clean up temporary directory after tests
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('should accumulate latency for valid ms (>0 and <1000)', () => {
        const keyCode = 65; // A
        const keyName = 'A';
        const latencyMs = 500;

        store.updateKeyMetrics(keyCode, keyName, latencyMs);

        const metric = store.data.key_metrics[keyCode];
        expect(metric.total_presses).toBe(1);
        expect(metric.accumulated_latency_ms).toBe(500);
    });

    test('should NOT accumulate latency when ms <= 0', () => {
        const keyCode = 66; // B
        const keyName = 'B';
        const latencyMs = 0;

        store.updateKeyMetrics(keyCode, keyName, latencyMs);

        const metric = store.data.key_metrics[keyCode];
        expect(metric.total_presses).toBe(1);
        expect(metric.accumulated_latency_ms).toBe(0);
    });

    test('should NOT accumulate latency when ms >= 1000', () => {
        const keyCode = 67; // C
        const keyName = 'C';
        const latencyMs = 1500;

        store.updateKeyMetrics(keyCode, keyName, latencyMs);

        const metric = store.data.key_metrics[keyCode];
        expect(metric.total_presses).toBe(1);
        expect(metric.accumulated_latency_ms).toBe(0);
    });

    test('should accumulate properly across multiple valid and invalid presses', () => {
        const keyCode = 68; // D
        const keyName = 'D';

        // Valid press
        store.updateKeyMetrics(keyCode, keyName, 200);
        // Invalid press (too high)
        store.updateKeyMetrics(keyCode, keyName, 1200);
        // Invalid press (zero)
        store.updateKeyMetrics(keyCode, keyName, 0);
        // Valid press
        store.updateKeyMetrics(keyCode, keyName, 300);

        const metric = store.data.key_metrics[keyCode];
        expect(metric.total_presses).toBe(4);
        expect(metric.accumulated_latency_ms).toBe(500); // 200 + 300
    });
});
