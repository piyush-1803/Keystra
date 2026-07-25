const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('./store');
const MetricsEngine = require('./metrics');

let mainWindow = null;
let overlayWindow = null;
let hookProcess = null;
let store = null;
let metrics = null;
let tray = null;

const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(__dirname, '../../dist/index.html'));

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: true,
        title: "Keystra | Dashboard",
        backgroundColor: '#131314',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 420,
        height: 80,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Make the overlay click-through by default
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    if (isDev) {
        overlayWindow.loadURL('http://localhost:5173/overlay.html');
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../../dist/overlay.html'));
    }

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

function startHook() {
    try {
        const hookPath = app.isPackaged 
            ? path.join(process.resourcesPath, 'KeystraHook.exe')
            : path.join(__dirname, '../hook/KeystraHook.exe');

        console.log('Spawning Keystra Hook from:', hookPath);

        hookProcess = spawn(hookPath);

        let buffer = '';
        hookProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            let lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                    const event = JSON.parse(trimmed);
                    
                    // Process event through metrics engine
                    metrics.processEvent(event, (liveStats) => {
                        // Forward real-time metrics to active renderers (overlay and dashboard)
                        if (overlayWindow && !overlayWindow.isDestroyed()) {
                            overlayWindow.webContents.send('live-metrics', liveStats);
                        }
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('live-metrics', liveStats);
                        }
                    });
                } catch (e) {
                    console.error('Failed to parse hook event:', trimmed, e);
                }
            }
        });

        hookProcess.stderr.on('data', (data) => {
            console.error(`Hook stderr: ${data}`);
        });

        hookProcess.on('close', (code) => {
            console.log(`Hook process exited with code ${code}`);
        });
    } catch (e) {
        console.error('Failed to start C# hook:', e);
    }
}

function stopHook() {
    if (hookProcess) {
        hookProcess.kill();
        hookProcess = null;
    }
}

function setupTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show Dashboard', 
            click: () => {
                if (!mainWindow) createMainWindow();
                else mainWindow.show();
            } 
        },
        { 
            label: 'Toggle Overlay', 
            click: () => {
                if (overlayWindow) {
                    overlayWindow.close();
                } else {
                    createOverlayWindow();
                }
            } 
        },
        { type: 'separator' },
        { 
            label: 'Quit Keystra', 
            click: () => {
                app.quit();
            } 
        }
    ]);
    tray.setToolTip('Keystra Typing Fitness Tracker');
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    store = new Store(app.getPath('userData'));
    metrics = new MetricsEngine(store);

    const { session } = require('electron');
    if (!isDev) {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data:;"]
                }
            });
        });
    }

    // Write a dummy 1x1 png if icon doesn't exist to prevent tray crash
    const fs = require('fs');
    const iconPath = path.join(__dirname, 'icon.png');
    if (!fs.existsSync(iconPath)) {
        // Simple base64 for a tiny placeholder icon (dot)
        const base64Icon = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYGD4D8SMQDFGBhQAbBikGjAasIUBWIPg//9o4BgNDKIBwxkYGBgYGBgYAFi7EwK4u65IAAAAAElFTkSuQmCC';
        fs.writeFileSync(iconPath, Buffer.from(base64Icon, 'base64'));
    }

    createMainWindow();
    createOverlayWindow();
    startHook();
    setupTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Keep app running in the system tray, don't quit
});

app.on('will-quit', () => {
    stopHook();
    if (metrics) {
        metrics.destroy();
    }
});

// IPC Communications
ipcMain.handle('get-stats', () => {
    return store.getStats();
});

ipcMain.handle('get-onboarding-status', () => {
    return store.isOnboardingComplete();
});

ipcMain.handle('set-onboarding-complete', () => {
    store.setOnboardingComplete();
    return true;
});

// Dynamic overlay mouse focus toggling
ipcMain.on('set-overlay-ignore-mouse', (event, ignore) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        if (ignore) {
            overlayWindow.setIgnoreMouseEvents(true, { forward: true });
        } else {
            overlayWindow.setIgnoreMouseEvents(false);
        }
    }
});

ipcMain.on('close-overlay', () => {
    if (overlayWindow) {
        overlayWindow.close();
    }
});
