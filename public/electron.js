const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 100,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Always load the dev server in development mode
  const isDev = process.env.NODE_ENV !== 'production'; // Simplified check
  const url = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(url).catch((err) => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.webContents.openDevTools(); // Open DevTools for debugging

  pythonProcess = spawn('python', [path.join(__dirname, '../backend/backend.py')]);
  pythonProcess.stdout.on('data', (data) => {
    console.log('Python says:', data.toString());
    try {
      const message = JSON.parse(data.toString());
      mainWindow.webContents.send('python-message', message);
    } catch (e) {
      console.error('Failed to parse Python message:', e);
    }
  });
  pythonProcess.stderr.on('data', (data) => console.error(data.toString()));

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

ipcMain.on('start-session', () => {
  pythonProcess.stdin.write(JSON.stringify({ command: 'start' }) + '\n');
});

ipcMain.on('stop-session', () => {
  pythonProcess.stdin.write(JSON.stringify({ command: 'stop' }) + '\n');
});

ipcMain.on('get-history', () => {
  pythonProcess.stdin.write(JSON.stringify({ command: 'history' }) + '\n');
});