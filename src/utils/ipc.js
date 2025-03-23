export const getIpcRenderer = () => {
  return Promise.resolve(window.electronAPI);
};
