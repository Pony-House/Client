import fs from 'fs';
import path from 'path';
import { app, ipcMain /* , protocol, net */ } from 'electron';
import { fileURLToPath /* , pathToFileURL */ } from 'url';

// Insert utils

const createDirName = (where) => {
  const __filename = fileURLToPath(where);
  const __dirname = path.dirname(__filename);
  return { __filename, __dirname };
};

// Validate Folders
const tempFolder = path.join(app.getPath('temp'), './pony-house-matrix');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}

const appDataFolder = path.join(app.getPath('appData'), './pony-house-matrix');
if (!fs.existsSync(appDataFolder)) {
  fs.mkdirSync(appDataFolder);
}

const appDataPrivate = path.join(app.getPath('appData'), './pony-house-matrix/tinyMatrixData');
if (!fs.existsSync(appDataPrivate)) {
  fs.mkdirSync(appDataPrivate);
}

const tempFolderNoti = path.join(tempFolder, './notification');
if (!fs.existsSync(tempFolderNoti)) {
  fs.mkdirSync(tempFolderNoti);
}

const tempFolderMedia = path.join(tempFolder, './media');
if (!fs.existsSync(tempFolderMedia)) {
  fs.mkdirSync(tempFolderMedia);
}

export function startTempFolders(win, extraPath) {
  ipcMain.on('getAppFolders', () => {
    win.webContents.send('getAppFolders', {
      extraPath,
      tempNotifications: tempFolderNoti,
      appDataPrivate,
      appData: appDataFolder,
      temp: tempFolder,
      tempMedia: tempFolderMedia,
    });
  });
}

/* protocol.registerSchemesAsPrivileged([
  {
    scheme: 'ponyhousetemp',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]); */

/* app.whenReady().then(() => {
  // Temp file protocol
  protocol.handle('ponyhousetemp', (req) => {
    const { pathname } = new URL(req.url);

    // NB, this checks for paths that escape the bundle, e.g.
    // app://bundle/../../secret_file.txt
    const pathToServe = path.resolve(__dirname, pathname);
    const relativePath = path.relative(__dirname, pathToServe);
    const isSafe = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    if (!isSafe) {
      return new Response('bad', {
        status: 400,
        headers: { 'content-type': 'text/html' },
      });
    }

    const filePath = req.url.slice('ponyhousetemp://'.length);
    const tinyUrl = pathToFileURL(path.join(tempFolderMedia, filePath)).toString();
    return net.fetch(tinyUrl, {
      method: 'GET',
    });
  });
}); */

export { createDirName, tempFolder, tempFolderNoti, appDataFolder, appDataPrivate };
