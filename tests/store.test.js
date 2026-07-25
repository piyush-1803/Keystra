const fs = require('fs');
const path = require('path');
const Store = require('../src/main/store');

jest.mock('fs');

describe('Store', () => {
    let originalConsoleError;
    const testUserDataPath = '/mock/user/data/path';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup console.error spy
        originalConsoleError = console.error;
        console.error = jest.fn();

        // Mock basic fs functionality to allow Store to initialize
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('save() atomic failure handling', () => {
        it('should handle fs.writeFileSync failure gracefully and log an error', () => {
            const mockError = new Error('Write failed');
            fs.writeFileSync.mockImplementationOnce(() => {
                throw mockError;
            });

            const store = new Store(testUserDataPath);
            store.save(); // Store init calls save(), let's clear mocks and call it explicitly

            jest.clearAllMocks();
            fs.writeFileSync.mockImplementationOnce(() => {
                throw mockError;
            });

            store.save();

            expect(console.error).toHaveBeenCalledWith('Failed to save Keystra store:', mockError);
            expect(fs.renameSync).not.toHaveBeenCalled(); // Shouldn't reach rename if write fails
        });

        it('should handle fs.renameSync failure gracefully and log an error', () => {
            const mockError = new Error('Rename failed');
            fs.writeFileSync.mockImplementation(() => {}); // Write succeeds

            // To allow init() to pass without errors, we should mock renameSync carefully
            const store = new Store(testUserDataPath);

            jest.clearAllMocks(); // Clear calls from init()

            fs.writeFileSync.mockImplementation(() => {});
            fs.renameSync.mockImplementationOnce(() => {
                throw mockError;
            });

            store.save();

            expect(console.error).toHaveBeenCalledWith('Failed to save Keystra store:', mockError);
        });
    });
});
