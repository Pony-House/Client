import { ipcRenderer } from 'electron';

import fs from 'fs';
import path from 'path';

import http from 'http';
import https from 'https';

// var filename = s.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const getAppFolders = () =>
  new Promise((resolve) => {
    ipcRenderer.once('getAppFolders', (event, result) => {
      resolve(result);
    });
    ipcRenderer.send('getAppFolders', true);
  });

export { getAppFolders };

// Save File
const saveDownloadFile = (info) =>
  new Promise((resolve, reject) => {
    const reqFunction = (response) => {
      const filePath = path.join(info.directory, `./${info.filename}`);
      const file = fs.createWriteStream(filePath);
      response.pipe(file);

      // after download completed close filestream
      file.on('finish', () => {
        file.close();
        resolve(`ponyhousetemp://${info.filename}`);
      });

      file.on('error', reject);
    };

    if (info.url.startsWith('https://')) {
      const req = https.get(info.url, reqFunction);
      req.on('error', reject);
    } else if (info.url.startsWith('http://')) {
      const req = http.get(info.url, reqFunction);
      req.on('error', reject);
    }
  });

export { saveDownloadFile };
