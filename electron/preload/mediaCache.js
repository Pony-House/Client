import { contextBridge } from 'electron';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

import { getAppFolders, saveDownloadFile } from './libs/utils';

// Prepare cache
let started = false;
const files = [];
let dirs = null;

const convertFileName = {
  decode: (url) => decodeURIComponent(url),
  encode: (url) => encodeURIComponent(url),
};

// Get file
const urlCache = {};
const getFile = async (url) => {
  if (dirs && (!urlCache[url] || !urlCache[url].downloading)) {
    urlCache[url] = { downloading: true, error: false };

    saveDownloadFile({
      url,
      directory: dirs.tempMedia,
      filename: convertFileName.encode(url),
    })
      .then((result) => {
        urlCache[url].downloading = false;
        urlCache[url].url = result;
      })
      .catch((err) => {
        console.error(err);
        urlCache[url].error = true;
        urlCache[url].downloading = false;
      });
  }
};

// Global get file url
const cacheFileElectron = (url, type) =>
  /* let value = url;

  // Use cache
  if (urlCache[url] && !urlCache[url].downloading && !urlCache[url].error) {
    value = urlCache[url].url;
  }

  // Use normal url and get the new cache
  else {
    getFile(url, type);
    value = url;
  }

  // Complete
  return value; */
  url;
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
