const Store = require('./store');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Store', () => {
    let store;
    let tempDir;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'keystra-test-'));
        store = new Store(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    describe('addSession', () => {
        it('should cap the sessions array at 500 items', () => {
            // Setup: add 500 sessions
            for (let i = 0; i < 500; i++) {
                store.addSession({ id: i, start_time: new Date().toISOString(), keystroke_count: 10 });
            }

            expect(store.data.sessions.length).toBe(500);
            expect(store.data.sessions[0].id).toBe(0);
            expect(store.data.sessions[499].id).toBe(499);

            // Action: add the 501st session
            store.addSession({ id: 500, start_time: new Date().toISOString(), keystroke_count: 10 });

            // Assert: length should still be 500
            expect(store.data.sessions.length).toBe(500);

            // Assert: the oldest session (id: 0) should be removed
            expect(store.data.sessions[0].id).toBe(1);

            // Assert: the newest session (id: 500) should be at the end
            expect(store.data.sessions[499].id).toBe(500);
        });
    });
});
