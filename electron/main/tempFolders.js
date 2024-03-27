import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import { fileURLToPath } from 'url';

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

export { createDirName, tempFolder, tempFolderNoti, appDataFolder, appDataPrivate };
