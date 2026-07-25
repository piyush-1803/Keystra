const { startHook } = require('./main');
const { spawn } = require('child_process');

jest.mock('electron', () => {
    return {
        app: {
            whenReady: jest.fn().mockReturnValue(new Promise(() => {})),
            getPath: jest.fn().mockReturnValue(''),
            isPackaged: false,
            on: jest.fn(),
            quit: jest.fn()
        },
        BrowserWindow: {
            getAllWindows: jest.fn().mockReturnValue([])
        },
        ipcMain: {
            handle: jest.fn(),
            on: jest.fn()
        },
        Tray: jest.fn(),
        Menu: {
            buildFromTemplate: jest.fn()
        },
        nativeImage: {
            createFromPath: jest.fn()
        }
    };
});

jest.mock('child_process', () => ({
    spawn: jest.fn()
}));

jest.mock('./store', () => {
    return jest.fn().mockImplementation(() => {
        return {};
    });
});

jest.mock('./metrics', () => {
    return jest.fn().mockImplementation(() => {
        return {
            processEvent: jest.fn(),
            destroy: jest.fn()
        };
    });
});

describe('startHook', () => {
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('should catch and log error if spawn fails', () => {
        const error = new Error('Spawn failed');
        spawn.mockImplementationOnce(() => {
            throw error;
        });

        startHook();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start C# hook:', error);
    });
});
