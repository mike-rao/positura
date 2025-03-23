const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 512,
    height: 512,
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const url = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(url).catch((err) => {
    console.error('Failed to load URL:', err);
  });

  pythonProcess = spawn('python', [path.join(__dirname, '../backend/backend.py')]);
  pythonProcess.stdout.on('data', (data) => {
    console.log('Python stdout:', data.toString());
    try {
      const message = JSON.parse(data.toString());
      mainWindow.webContents.send('python-message', message);
    } catch (e) {
      console.error('Failed to parse Python message:', e);
    }
  });
  pythonProcess.stderr.on('data', (data) => {
    console.error('Python stderr:', data.toString());
  });

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
  if (pythonProcess) {
    console.log('Sending start command to Python');
    pythonProcess.stdin.write(JSON.stringify({ command: 'start' }) + '\n');
  }
});

ipcMain.on('stop-session', () => {
  if (pythonProcess) {
    console.log('Sending stop command to Python');
    pythonProcess.stdin.write(JSON.stringify({ command: 'stop' }) + '\n');
  }
});

ipcMain.on('get-history', (event) => {
  console.log('Received get-history request');
  if (pythonProcess) {
    console.log('Sending history command to Python');
    pythonProcess.stdin.write(JSON.stringify({ command: 'history' }) + '\n');
  } else {
    console.log('Python process not available');
  }
});

ipcMain.on('window-control', (event, action) => {
  console.log('Received window control action:', action);
  if (mainWindow) {
    if (action === 'minimize') {
      mainWindow.minimize();
    } else if (action === 'close') {
      mainWindow.close();
    }
  }
});

ipcMain.on('get-summary', () => {
  console.log('Received get-summary command');
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('python-message', { command: 'get-summary' });
  }
});