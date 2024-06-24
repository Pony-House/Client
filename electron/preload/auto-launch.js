import { contextBridge, ipcRenderer } from 'electron';
import AutoLaunch from 'auto-launch';

let useLoadingElectron;
ipcRenderer.on('check-version', () => {
  console.log('[electron] Checking version...');
  if (typeof global.versionChecker === 'function') global.versionChecker();
  console.log('[electron] Version check complete!');
});

ipcRenderer.on('refresh-client', () => {
  console.log('[electron] Realoding page...');
  if (useLoadingElectron) useLoadingElectron.appendLoading();
  global.location.reload();
});

ipcRenderer.on('console-message', (event, msg, msg2) => {
  console.log(msg, msg2);
});

ipcRenderer.on('electron-cache-values', (event, msg) => {
  console.log('[electron-cache]', msg);
});

let tinyModule;
const autoLaunch = {
  started: false,
  start: (name) => {
    if (!tinyModule) {
      tinyModule = new AutoLaunch({
        name,
        path: process.execPath,
      });
    }
  },

  enable: () => (tinyModule ? tinyModule.enable() : null),
  disable: () => (tinyModule ? tinyModule.disable() : null),
  isEnabled: () => (tinyModule ? tinyModule.isEnabled() : null),
};

contextBridge.exposeInMainWorld('autoLaunch', autoLaunch);
contextBridge.exposeInMainWorld('electronCacheValues', () => {
  ipcRenderer.send('electron-cache-values', true);
});
export default function startAutoLaunch(newUseLoadingElectron) {
  useLoadingElectron = newUseLoadingElectron;
}
