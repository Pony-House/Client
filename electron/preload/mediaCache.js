import { contextBridge } from 'electron';

// WIP
const cacheFileElectron = (url) => {
  return { value: url, complete: false };
};

contextBridge.exposeInMainWorld('cacheFileElectron', cacheFileElectron);
