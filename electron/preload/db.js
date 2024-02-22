import { contextBridge, ipcRenderer } from 'electron';
import { generateApiKey } from 'generate-api-key';
import clone from 'clone';

const dbCache = {};

contextBridge.exposeInMainWorld('tinyDB', {
  run: (value1, value2) =>
    new Promise((resolve, reject) => {
      const id = generateApiKey();
      dbCache[id] = { resolve, reject };
      ipcRenderer.send('requestDB', 'run', id, value1, value2);
    }),
  all: (value1, value2) =>
    new Promise((resolve, reject) => {
      const id = generateApiKey();
      dbCache[id] = { resolve, reject };
      ipcRenderer.send('requestDB', 'all', id, value1, value2);
    }),
  get: (value1, value2) =>
    new Promise((resolve, reject) => {
      const id = generateApiKey();
      dbCache[id] = { resolve, reject };
      ipcRenderer.send('requestDB', 'get', id, value1, value2);
    }),
  runPing: () =>
    new Promise((resolve, reject) => {
      const id = generateApiKey();
      dbCache[id] = { resolve, reject };
      ipcRenderer.send('requestDBPing', id);
    }),
});

/*
    clearData
    clearCacheData
    startClient
*/

ipcRenderer.on('requestDB', (event, result) => {
  if (dbCache[result.id]) {
    if (typeof result.err !== 'undefined') dbCache[result.id].reject(clone(result.err));
    else dbCache[result.id].resolve(clone(result.result));
    delete dbCache[result.id];
  }
});
