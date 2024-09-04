import EventEmitter from 'events';
import WebSocket from 'ws';

import { objType } from 'for-promise/utils/lib.mjs';
import tinyAPI from '@src/util/mods';
import { fetchFn } from '@src/client/initMatrix';

class SinkingApi extends EventEmitter {
  constructor() {
    super();
    this._API_SOCKET = 'wss://phish.sinking.yachts';
    this._API_HTTP = 'https://phish.sinking.yachts';
    this._WEBSITE = 'https://sinking.yachts/';
    this._TAG = '[Sinking Yachts]';
    this.ws = null;
  }

  startSocket(xIdentity = 'PonyHouse-MatrixClient', isRestart = false) {
    if (!this.ws || isRestart) {
      const tinyThis = this;
      this.ws = new WebSocket(`${this._API_SOCKET}/feed`, { headers: { 'X-Identity': xIdentity } });

      // Open
      this.ws.on('open', () => {
        console.log(`${tinyThis._TAG} Socket connected.`);
      });

      // Close
      this.ws.on('close', () => {
        console.log(`${tinyThis._TAG} Socket disconnected.`);
        tinyThis.startSocket(xIdentity, true);
      });

      // Message
      this.ws.on('message', (data, isBinary) => {
        // Try
        try {
          // Message
          let message = isBinary ? data : data.toString();

          // Filter
          if (typeof message === 'string') {
            message = JSON.parse(message);
          }

          console.log(tinyThis._TAG, message);

          // Check
          if (
            objType(message, 'object') &&
            Array.isArray(message.domains) &&
            message.domains.length > 0
          ) {
            // Add
            if (message.type === 'add') {
              for (const item in message.domains) {
                if (typeof message.domains[item] === 'string') {
                  tinyThis.emit('add', message.domains[item]);
                }
              }
            }

            // Remove
            else if (message.type === 'delete') {
              for (const item in message.domains) {
                if (typeof message.domains[item] === 'string') {
                  tinyThis.emit('delete', message.domains[item]);
                }
              }
            }
          }
        } catch (err) {
          // Error
          console.error(err);
        }
      });
    } else {
      throw new Error(`${this._TAG} The socket is started!`);
    }
  }

  check(host) {
    return new Promise((resolve, reject) =>
      fetchFn(`${this._API_HTTP}/v2/check/${host}`, {
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
  }

  getChanges(dt) {
    return new Promise((resolve, reject) =>
      fetchFn(`${this._API_HTTP}/v2/recent/${String(dt)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
        .then((res) => res.json())
        .then(resolve)
        .catch(reject),
    );
  }

  dbSize() {
    return new Promise((resolve, reject) =>
      fetchFn(`${this._API_HTTP}/v2/dbsize`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
        .then((res) => res.json())
        .then((amount) => {
          if (typeof amount === 'number') resolve(amount);
          else resolve(null);
        })
        .catch(reject),
    );
  }

  all() {
    return new Promise((resolve, reject) =>
      fetchFn(`${this._API_HTTP}/v2/all`, {
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
  }
}

const sinkingApi = new SinkingApi();

export default sinkingApi;

export function startSinkingYachts() {
  if (__ENV_APP__.ELECTRON_MODE) {
    // Welcome
    console.log(`${sinkingApi._TAG} Scammers protection mod activated! ${sinkingApi._WEBSITE}`);

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
            sinkingApi
              .check(host)
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
      `${sinkingApi._TAG} This mod is only compativel with the desktop version. The mod was disabled automatically.`,
    );
  }
}
