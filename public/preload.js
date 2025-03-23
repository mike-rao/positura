const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-control', 'minimize'),
  closeWindow: () => ipcRenderer.send('window-control', 'close'),
  getHistory: () => ipcRenderer.send('get-history'),
  startSession: () => ipcRenderer.send('start-session'),
  stopSession: () => ipcRenderer.send('stop-session'),
  getSummary: () => ipcRenderer.send('get-summary'),
  onPythonMessage: (callback) => ipcRenderer.on('python-message', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
