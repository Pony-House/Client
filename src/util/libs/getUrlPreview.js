import * as linkify from 'linkifyjs';

import initMatrix from '../../client/initMatrix';
import { objType } from '../tools';
import convertProtocols from './convertProtocols';

const tinyCache = {};
const urlConvert = {
  http: (url) => `https${url.substring(4, url.length)}`,
};

const localStoragePlace = 'pony-house-url-preview';
const urlPreviewStore = {
  getRaw: () => {
    try {
      const rawStorage = global.localStorage.getItem(localStoragePlace);
      if (typeof rawStorage === 'string' && rawStorage.length > 0) {
        const storage = JSON.parse(rawStorage);
        return storage;
      }

      return {};
    } catch (err) {
      console.error(err);
      return {};
    }
  },

  validator: (value) =>
    objType(value, 'object') &&
    objType(value.data, 'object') &&
    typeof value.timeout === 'number' &&
    value.timeout > 0,

  get: (url) => {
    const storage = urlPreviewStore.getRaw();
    if (typeof url === 'string') {
      if (linkify.test(url)) {
        if (urlPreviewStore.validator(storage[url])) {
          return storage[url];
        }

        urlPreviewStore.delete(url);
      }
    } else {
      for (const url2 in storage) {
        if (!urlPreviewStore.validator(storage[url2])) {
          delete storage[url2];
          urlPreviewStore.delete(url2);
        }
      }

      return storage;
    }

    return null;
  },

  set: (url, value) => {
    if ((typeof url === 'string' && linkify.test(url)) || value === null) {
      const storage = urlPreviewStore.getRaw();

      if (value !== null && urlPreviewStore.validator(value)) {
        storage[url] = value;
      } else if (storage[url]) {
        delete storage[url];
      }

      return global.localStorage.setItem(localStoragePlace, JSON.stringify(storage));
    }

    return null;
  },

  delete: (url) => urlPreviewStore.set(url, null),

  refresh: () => {
    const newData = urlPreviewStore.get();

    for (const item in newData) {
      tinyCache[item] = newData[item];
    }
  },
};

setInterval(() => {
  for (const item in tinyCache) {
    if (tinyCache[item].timeout > 0) {
      tinyCache[item].timeout--;

      // eslint-disable-next-line no-use-before-define
      setTimeout(() => {
        urlPreviewStore.set(item, tinyCache[item]);
      }, 1);
    } else {
      delete tinyCache[item];

      // eslint-disable-next-line no-use-before-define
      setTimeout(() => {
        urlPreviewStore.delete(item);
      }, 1);
    }
  }
}, 60000);

urlPreviewStore.refresh();

export { urlPreviewStore };

export default function getUrlPreview(newUrl, ts = 0) {
  return new Promise((resolve, reject) => {
    const mx = initMatrix.matrixClient;
    if (typeof newUrl === 'string' && linkify.test(newUrl)) {
      const url = convertProtocols(newUrl, newUrl);

      if (
        tinyCache[url.href] &&
        (objType(tinyCache[url.href].data, 'object') || tinyCache[url.href].data === null)
      ) {
        resolve(tinyCache[url.href].data);
      } else {
        let tinyUrl = url.href;
        for (const item in urlConvert) {
          if (tinyUrl.startsWith(`${item}://`)) {
            tinyUrl = urlConvert[item](tinyUrl);
            break;
          }
        }

        const storeCache = urlPreviewStore.get(tinyUrl);
        if (!storeCache) {
          mx.getUrlPreview(tinyUrl, ts)
            .then((embed) => {
              tinyCache[url.href] = { data: embed, timeout: 1440 };
              urlPreviewStore.set(url.href, tinyCache[url.href]);
              resolve(embed);
            })
            .catch((err) => {
              tinyCache[url.href] = { data: null, timeout: 60 };
              urlPreviewStore.delete(url.href);
              reject(err);
            });
        } else {
          resolve(storeCache.data);
        }
      }
    }
  });
}
