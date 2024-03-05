import { contextBridge, ipcRenderer } from 'electron';
import clone from 'clone';
import path from 'path';
import fs from 'fs';

import { objType } from '@src/util/tools';

const getAppFolders = () =>
  new Promise((resolve) => {
    ipcRenderer.once('getAppFolders', (event, result) => {
      resolve(result);
    });
    ipcRenderer.send('getAppFolders', true);
  });

let started = false;
let folders = {};
let data = {};

let savingJSON = false;
let waitingJSON = null;
const saveJSON = () => {
  if (!savingJSON) {
    savingJSON = true;
    fs.writeFile(
      path.join(folders.appDataPrivate, `data${folders.extraPath}.json`),
      JSON.stringify(data),
      'utf8',
      (err) => {
        if (err) console.error(err);
        savingJSON = false;
      },
    );
  } else {
    if (waitingJSON) clearTimeout(waitingJSON);
    waitingJSON = setTimeout(() => {
      if (waitingJSON) clearTimeout(waitingJSON);
      waitingJSON = null;
      saveJSON();
    }, 500);
  }
};

const tinyJsonDB = {
  getFolders: () => clone(folders),

  startClient: async () => {
    if (!started) {
      started = true;
      folders = await getAppFolders();

      // Get Data
      const initFile = path.join(folders.appDataPrivate, `data${folders.extraPath}.json`);
      try {
        data = JSON.parse(fs.readFileSync(initFile, 'utf8'));
        if (!objType(data, 'object')) data = {};
      } catch (e) {
        data = {};
      }
    }
  },

  get: (folder, where) =>
    objType(data[folder], 'object')
      ? typeof data[folder][where] !== 'undefined'
        ? clone(data[folder][where])
        : null
      : null,
  getAll: (folder) => (objType(data[folder], 'object') ? clone(data[folder]) : null),

  update: (folder, where, value) => {
    if (!objType(data[folder], 'object')) data[folder] = {};
    data[folder][where] = value;
    saveJSON();
  },
};

contextBridge.exposeInMainWorld('tinyJsonDB', tinyJsonDB);
