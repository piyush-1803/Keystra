const fs = require('fs');
const path = require('path');
const Store = require('./store');

// Mock fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    renameSync: jest.fn(),
}));

describe('Store', () => {
    const dummyPath = '/dummy/user/data/path';
    const dummyFilePath = path.join(dummyPath, 'data.json');
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('Initialization and Fallback Creation', () => {
        test('creates directory and file when directory does not exist', () => {
            fs.existsSync.mockImplementation((checkPath) => {
                if (checkPath === dummyPath) return false;
                if (checkPath === dummyFilePath) return false;
                return false;
            });

            const store = new Store(dummyPath);

            // Expect directory to be created
            expect(fs.mkdirSync).toHaveBeenCalledWith(dummyPath, { recursive: true });

            // Expect fallback file to be created via this.save()
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                dummyFilePath + '.tmp',
                expect.any(String),
                'utf8'
            );
            expect(fs.renameSync).toHaveBeenCalledWith(dummyFilePath + '.tmp', dummyFilePath);

            // Ensure data structure is initialized properly
            expect(store.data).toBeDefined();
            expect(store.data.onboardingCompleted).toBe(false);
        });

        test('creates file when directory exists but file does not', () => {
            fs.existsSync.mockImplementation((checkPath) => {
                if (checkPath === dummyPath) return true; // Directory exists
                if (checkPath === dummyFilePath) return false; // File doesn't
                return false;
            });

            const store = new Store(dummyPath);

            // Expect directory NOT to be created
            expect(fs.mkdirSync).not.toHaveBeenCalled();

            // Expect fallback file to be created via this.save()
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                dummyFilePath + '.tmp',
                expect.any(String),
                'utf8'
            );
            expect(fs.renameSync).toHaveBeenCalledWith(dummyFilePath + '.tmp', dummyFilePath);
        });

        test('reads and merges data when directory and file exist', () => {
            fs.existsSync.mockReturnValue(true);

            const existingData = {
                onboardingCompleted: true,
                streaks: {
                    currentStreak: 5,
                    lastActiveDate: '2023-10-25',
                    dailyKeys: { '2023-10-25': 1500 }
                }
            };
            fs.readFileSync.mockReturnValue(JSON.stringify(existingData));

            const store = new Store(dummyPath);

            // No creation should happen
            expect(fs.mkdirSync).not.toHaveBeenCalled();
            expect(fs.writeFileSync).not.toHaveBeenCalled();

            // Data should be merged
            expect(store.data.onboardingCompleted).toBe(true);
            expect(store.data.streaks.currentStreak).toBe(5);
            expect(store.data.sessions).toEqual([]); // from default state
        });

        test('handles errors during file read gracefully', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => {
                throw new Error('Disk read error');
            });

            let store;
            expect(() => {
                store = new Store(dummyPath);
            }).not.toThrow();

            // Check that default data is still there and error was logged
            expect(store.data).toBeDefined();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to load Keystra store:',
                expect.any(Error)
            );
        });

        test('handles errors during json parse gracefully', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue('{ invalid json }');

            let store;
            expect(() => {
                store = new Store(dummyPath);
            }).not.toThrow();

            // Check that error was logged
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to load Keystra store:',
                expect.any(SyntaxError)
            );
        });
    });
});
