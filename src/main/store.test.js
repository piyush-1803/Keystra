const fs = require('fs');
const Store = require('./store');

jest.mock('fs');

describe('Store - updateStreak', () => {
    let store;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup basic mock implementations to prevent actual file system operations
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
        fs.writeFileSync.mockImplementation(() => {});
        fs.renameSync.mockImplementation(() => {});

        // Instantiate Store
        store = new Store('/mock/path');
    });

    test('should initialize streak to 1 for first time active', () => {
        store.updateStreak('2023-10-01');

        expect(store.data.streaks.currentStreak).toBe(1);
        expect(store.data.streaks.lastActiveDate).toBe('2023-10-01');
    });

    test('should not increment streak if updated on the same day', () => {
        store.updateStreak('2023-10-01');
        expect(store.data.streaks.currentStreak).toBe(1);

        store.updateStreak('2023-10-01');
        expect(store.data.streaks.currentStreak).toBe(1);
        expect(store.data.streaks.lastActiveDate).toBe('2023-10-01');
    });

    test('should increment streak if updated on consecutive days', () => {
        store.updateStreak('2023-10-01');
        expect(store.data.streaks.currentStreak).toBe(1);

        store.updateStreak('2023-10-02');
        expect(store.data.streaks.currentStreak).toBe(2);
        expect(store.data.streaks.lastActiveDate).toBe('2023-10-02');
    });

    test('should reset streak to 1 if a day is missed', () => {
        store.updateStreak('2023-10-01');
        store.updateStreak('2023-10-02');
        expect(store.data.streaks.currentStreak).toBe(2);

        // Missed Oct 3, updated on Oct 4
        store.updateStreak('2023-10-04');
        expect(store.data.streaks.currentStreak).toBe(1);
        expect(store.data.streaks.lastActiveDate).toBe('2023-10-04');
    });

    test('should increment streak correctly over month boundaries', () => {
        store.updateStreak('2023-01-31');
        expect(store.data.streaks.currentStreak).toBe(1);

        store.updateStreak('2023-02-01');
        expect(store.data.streaks.currentStreak).toBe(2);
        expect(store.data.streaks.lastActiveDate).toBe('2023-02-01');
    });

    test('should increment streak correctly over leap year boundaries', () => {
        store.updateStreak('2024-02-29'); // Leap year
        store.updateStreak('2024-03-01');
        expect(store.data.streaks.currentStreak).toBe(2);
    });

    test('should reset streak over month boundaries if a day is missed', () => {
        store.updateStreak('2023-01-31');
        expect(store.data.streaks.currentStreak).toBe(1);

        // Missed Feb 1, updated Feb 2
        store.updateStreak('2023-02-02');
        expect(store.data.streaks.currentStreak).toBe(1);
        expect(store.data.streaks.lastActiveDate).toBe('2023-02-02');
    });

    test('should increment streak correctly over year boundaries', () => {
        store.updateStreak('2023-12-31');
        expect(store.data.streaks.currentStreak).toBe(1);

        store.updateStreak('2024-01-01');
        expect(store.data.streaks.currentStreak).toBe(2);
        expect(store.data.streaks.lastActiveDate).toBe('2024-01-01');
    });
});
