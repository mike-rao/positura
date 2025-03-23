export const getIpcRenderer = () => {
    return new Promise((resolve) => {
      const checkIpc = () => {
        if (window.ipcRenderer) {
          console.log('ipcRenderer is now available');
          resolve(window.ipcRenderer);
        } else {
          console.log('Waiting for ipcRenderer...');
          setTimeout(checkIpc, 100);
        }
      };
      checkIpc();
    });
  };