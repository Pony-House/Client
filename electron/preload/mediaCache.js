import { contextBridge } from 'electron';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

import { getAppFolders } from './libs/utils';

// Prepare cache
let started = false;
const files = [];
let dirs = null;

// Get file
const urlCache = {};
const getFile = async (url) => {
  if (dirs) {
    const folder = dirs.tempMedia;
    // Escrever aqui o script que vai baixar o arquivo para fazer cache no pc. Isso precisa ser feito individualmente. E detectar quando um arquivo já está sendo baixado para não se repetir mais de uma vez.
  }
};

const convertFileName = {
  decode: () => {},
  encode: () => {},
};

// Global get file url
const cacheFileElectron = (url, type) => {
  let value = url;

  // Use cache
  if (urlCache[url]) {
    value = urlCache[url].url;
  }

  // Use normal url and get the new cache
  else {
    getFile(url, type);
    value = url;
  }

  // Complete
  return value;
};

// Start module
contextBridge.exposeInMainWorld('startMediaCacheElectron', async () => {
  if (!started) {
    started = true;
    dirs = await getAppFolders();
    fs.readdirSync(dirs.tempMedia).forEach((fileName) => {
      // Get file path
      const filePath = path.join(dirs.tempMedia, fileName);

      // Normal file
      if (!fileName.endsWith('.download')) {
        // Check path
        if (fs.lstatSync(filePath).isFile()) {
          const codedFile = convertFileName.decode(fileName);
          // File cache confirmed. Add this
          if (files.indexOf(codedFile) < 0) files.push(codedFile);
        }
      }

      // Delete download cache
      else {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(err);
        }
      }
    });

    // Check complete
    console.log('[media-cache] Data array loaded.', files);

    // Watch folder
    const watcher = chokidar.watch(dirs.tempMedia, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    });

    // Events
    watcher
      .on('add', (filePath) => {
        const fileName = path.basename(filePath);
        if (
          path.join(dirs.tempMedia, `./${fileName}`) === filePath &&
          !fileName.endsWith('.download')
        ) {
          const codedFile = convertFileName.decode(fileName);
          if (files.indexOf(codedFile) < 0) files.push(codedFile);
        }
      })
      .on('change', (filePath) => {
        const fileName = path.basename(filePath);
        if (
          path.join(dirs.tempMedia, `./${fileName}`) === filePath &&
          !fileName.endsWith('.download')
        ) {
          const codedFile = convertFileName.decode(fileName);
          if (files.indexOf(codedFile) < 0) files.push(codedFile);
        }
      })
      .on('unlink', (filePath) => {
        const fileName = path.basename(filePath);
        const codedFile = convertFileName.decode(fileName);
        const index = files.indexOf(codedFile);
        if (index > -1) files.splice(index, 1);
      })
      .on('error', (error) => console.error(error));
  }
});

// Main functions
contextBridge.exposeInMainWorld('cacheFileElectron', cacheFileElectron);
contextBridge.exposeInMainWorld(
  'getAppFolders',
  () =>
    new Promise((resolve, reject) => {
      getAppFolders().then(resolve).catch(reject);
    }),
);
