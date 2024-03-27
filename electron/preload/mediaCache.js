import { contextBridge } from 'electron';
import path from 'path';
import fs from 'fs';

import { getAppFolders } from './libs/utils';

// WIP
const urlCache = {};
const getFile = async (url) => {
  const folders = await getAppFolders();
};

const cacheFileElectron = (url, type) => {
  let value = url;

  if (urlCache[url]) {
    value = urlCache[url];
  } else {
    getFile(url, type);
    value = url;
  }

  return value;
};

contextBridge.exposeInMainWorld('cacheFileElectron', cacheFileElectron);
