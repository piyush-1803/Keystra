const { spawn } = require('child_process');
const path = require('path');

// 1. Start Vite dev server
console.log('Starting Vite development server...');
const viteProcess = spawn('npx.cmd', ['vite'], {
    shell: true,
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
    electronProcess = spawn('npx.cmd', ['electron', 'src/main/main.js'], {
        shell: true,
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
