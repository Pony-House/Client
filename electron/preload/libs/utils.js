import { ipcRenderer } from 'electron';
import { generateApiKey } from 'generate-api-key';

const getAppFolders = () =>
  new Promise((resolve) => {
    ipcRenderer.once('getAppFolders', (event, result) => {
      resolve(result);
    });
    ipcRenderer.send('getAppFolders', true);
  });

export { getAppFolders };

const saveDownloadFileCache = {};
ipcRenderer.on('save-download-file', (event, result) => {
  if (saveDownloadFileCache[result.id]) {
    if (!result.err) {
      saveDownloadFileCache[result.id].resolve(result.path);
    } else {
      const err = new Error(result.err.message);
      if (typeof result.err.code !== 'undefined') err.code = result.err.code;
      if (typeof result.err.stack !== 'undefined') err.stack = result.err.stack;
      if (typeof result.err.errno !== 'undefined') err.errno = result.err.errno;

      saveDownloadFileCache[result.id].reject(err);
    }

    delete saveDownloadFileCache[result.id];
  }
});
const saveDownloadFile = (info) =>
  new Promise((resolve, reject) => {
    info.id = generateApiKey();
    saveDownloadFileCache[info.id] = { resolve, reject };
    ipcRenderer.send('save-download-file', info);
  });

export { saveDownloadFile };
