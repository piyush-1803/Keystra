const { spawn } = require('child_process');
const { app } = require('electron');

// Mock child_process.spawn
jest.mock('child_process', () => {
    const EventEmitter = require('events');
    return {
        spawn: jest.fn().mockImplementation(() => {
            const hookProcess = new EventEmitter();
            hookProcess.stdout = new EventEmitter();
            hookProcess.stderr = new EventEmitter();
            hookProcess.kill = jest.fn();
            return hookProcess;
        })
    };
});

// Mock electron
jest.mock('electron', () => {
    let whenReadyCallback;
    return {
        app: {
            whenReady: jest.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    whenReadyCallback = resolve;
                });
            }),
            getPath: jest.fn().mockReturnValue('/mock/path'),
            isPackaged: false,
            on: jest.fn()
        },
        BrowserWindow: jest.fn().mockImplementation(() => ({
            loadURL: jest.fn(),
            loadFile: jest.fn(),
            on: jest.fn(),
            setIgnoreMouseEvents: jest.fn()
        })),
        ipcMain: {
            handle: jest.fn(),
            on: jest.fn()
        },
        Tray: jest.fn().mockImplementation(() => ({
            setToolTip: jest.fn(),
            setContextMenu: jest.fn()
        })),
        Menu: {
            buildFromTemplate: jest.fn()
        },
        nativeImage: {
            createFromPath: jest.fn()
        },
        // Helper to manually trigger whenReady
        _triggerWhenReady: () => {
            if (whenReadyCallback) whenReadyCallback();
        }
    };
});

// Mock Store and MetricsEngine
jest.mock('./store', () => {
    return jest.fn().mockImplementation(() => ({}));
});

jest.mock('./metrics', () => {
    return jest.fn().mockImplementation(() => ({
        processEvent: jest.fn()
    }));
});

describe('main.js - hook stream invalid JSON handling', () => {
    let consoleErrorSpy;
    let mockStdout;

    beforeAll(() => {
        // Prevent console.error from spamming test output and allow us to verify it
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Prevent console.log as well
        jest.spyOn(console, 'log').mockImplementation(() => {});

        // Require main.js, which sets up app.whenReady
        require('./main');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should catch and log error when receiving corrupted JSON on hook stdout', async () => {
        // Trigger app.whenReady() to execute the setup including startHook
        const electron = require('electron');
        await electron._triggerWhenReady();

        // Get the mock instance returned by spawn
        const hookProcessInstance = spawn.mock.results[0].value;
        mockStdout = hookProcessInstance.stdout;

        // Emit a corrupted JSON string followed by a newline
        const corruptedJson = '{ invalid_json: true ';
        mockStdout.emit('data', Buffer.from(corruptedJson + '\n'));

        // Expect console.error to be called with the parsing error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to parse hook event:',
            corruptedJson.trim(),
            expect.any(SyntaxError)
        );
    });
});
