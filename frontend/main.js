const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;
let nextProcess;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load from the Next.js dev server
  win.loadURL('http://localhost:3000');

  // Open DevTools for debugging (optional)
  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

function startNextServer() {
  // Start the Next.js server
  nextProcess = exec('npm run start', { cwd: __dirname }, (err) => {
    if (err) {
      console.error('Failed to start Next.js server:', err);
    }
  });

  // Log server output for debugging
  nextProcess.stdout.on('data', (data) => console.log(data));
  nextProcess.stderr.on('data', (data) => console.error(data));
}

app.whenReady().then(() => {
  startNextServer();

  // Wait briefly for the server to start, then create the window
  setTimeout(() => {
    createWindow();
  }, 2000); // Adjust delay if needed

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  // Kill the Next.js server when the app closes
  if (nextProcess) {
    nextProcess.kill();
  }
});