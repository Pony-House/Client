import { ipcRenderer } from 'electron';

const getAppFolders = () =>
  new Promise((resolve) => {
    ipcRenderer.once('getAppFolders', (event, result) => {
      resolve(result);
    });
    ipcRenderer.send('getAppFolders', true);
  });

export { getAppFolders };
