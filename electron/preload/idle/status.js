/* eslint-disable @typescript-eslint/ban-types */
import { contextBridge, ipcRenderer } from 'electron';

let idleSecs = 'active';
let idleSecsCallback = (arg) => arg;

contextBridge.exposeInMainWorld('systemIdleState', {
  exec: () => ipcRenderer.send('systemIdleState', true),
  callback: (callback) => {
    if (typeof callback === 'function') idleSecsCallback = callback;
  },
  get: () => idleSecs,
});

ipcRenderer.on('systemIdleState', (_event, arg) => {
  idleSecs = arg;
  if (typeof idleSecsCallback === 'function') idleSecsCallback(arg);
});
