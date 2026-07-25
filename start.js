const { spawn } = require('child_process');
const path = require('path');

// 1. Start Vite dev server
console.log('Starting Vite development server...');
const viteProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite'], {
    shell: false,
    env: { ...process.env, FORCE_COLOR: true }
});

viteProcess.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`[Vite] ${text.trim()}`);
    
    // Once Vite reports it is ready, spawn Electron
    if (text.includes('Local:') || text.includes('http://localhost:5173')) {
        launchElectron();
    }
});

viteProcess.stderr.on('data', (data) => {
    console.error(`[Vite Error] ${data}`);
});

let electronProcess = null;

function launchElectron() {
    if (electronProcess) return; // Prevent double spawn

    console.log('Launching Electron window...');
    electronProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron', 'src/main/main.js'], {
        shell: false,
        env: { ...process.env, NODE_ENV: 'development' }
    });

    electronProcess.stdout.on('data', (data) => {
        console.log(`[Electron] ${data.toString().trim()}`);
    });

    electronProcess.stderr.on('data', (data) => {
        console.error(`[Electron Error] ${data.toString().trim()}`);
    });

    electronProcess.on('close', (code) => {
        console.log('Electron closed. Shutting down Vite server...');
        viteProcess.kill();
        process.exit(code);
    });
}

process.on('SIGINT', () => {
    if (electronProcess) electronProcess.kill();
    viteProcess.kill();
    process.exit(0);
});
