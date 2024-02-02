/* eslint-disable @typescript-eslint/ban-types */
import { contextBridge, ipcRenderer } from 'electron';

let idleSecs = 0;
let idleSecsCallback = (arg) => arg;

contextBridge.exposeInMainWorld('systemIdleTime', {
  exec: () => ipcRenderer.send('systemIdleTime', true),
  callback: (callback) => {
    if (typeof callback === 'function') idleSecsCallback = callback;
  },
  get: () => idleSecs,
});

ipcRenderer.on('systemIdleTime', (_event, arg) => {
  idleSecs = arg;
  if (typeof idleSecsCallback === 'function') idleSecsCallback(arg);
});
