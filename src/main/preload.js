const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('keystraAPI', {
    getStats: () => ipcRenderer.invoke('get-stats'),
    getOnboardingStatus: () => ipcRenderer.invoke('get-onboarding-status'),
    setOnboardingComplete: () => ipcRenderer.invoke('set-onboarding-complete'),
    setOverlayIgnoreMouse: (ignore) => ipcRenderer.send('set-overlay-ignore-mouse', ignore),
    closeOverlay: () => ipcRenderer.send('close-overlay'),
    onLiveMetrics: (callback) => {
        const subscription = (event, value) => callback(value);
        ipcRenderer.on('live-metrics', subscription);
        return () => {
            ipcRenderer.removeListener('live-metrics', subscription);
        };
    }
});
