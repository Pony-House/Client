import { objType } from 'for-promise/utils/lib.mjs';
import tinyAPI from '@src/util/mods';
import { fetchFn } from '@src/client/initMatrix';

export const SINKING_API_HTTP = 'https://phish.sinking.yachts';
export const SINKING_WEBSITE = 'https://sinking.yachts/';
export const SINKING_TAG = '[Sinking Yachts]';

export const sinkingChecker = (host) =>
  new Promise((resolve, reject) =>
    fetchFn(`${SINKING_API_HTTP}/v2/check/${host}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === 'boolean') resolve(data);
        else resolve(false);
      })
      .catch(reject),
  );

export const sinkingGetAll = () =>
  new Promise((resolve, reject) =>
    fetchFn(`${SINKING_API_HTTP}/v2/all`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          let allowed = true;
          for (const item in data) {
            if (typeof data[item] !== 'string') {
              allowed = false;
              break;
            }
          }

          if (allowed) resolve(data);
          else resolve([]);
        } else resolve([]);
      })
      .catch(reject),
  );

export default function sinkingYachts() {
  if (__ENV_APP__.ELECTRON_MODE) {
    // Welcome
    console.log(`${SINKING_TAG} Scammers protection mod activated! ${SINKING_WEBSITE}`);

    // Function
    tinyAPI.on(
      'openUrlChecker',
      (data, host, protocol) =>
        new Promise((resolve, reject) => {
          if (
            (protocol === 'https:' || protocol === 'http:') &&
            (!objType(data, 'object') || !data.isScammer)
          ) {
            const newTinyData = { isScammer: false };
            sinkingChecker(host)
              .then((result) => {
                newTinyData.isScammer = result;
                resolve(newTinyData);
              })
              .catch(reject);
          } else {
            resolve(data);
          }
        }),
    );
  }

  // Invalid device
  else {
    console.log(
      `${SINKING_TAG} This mod is only compativel with the desktop version. The mod was disabled automatically.`,
    );
  }
}
