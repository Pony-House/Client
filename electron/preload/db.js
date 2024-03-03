import { contextBridge, ipcRenderer } from 'electron';
import { generateApiKey } from 'generate-api-key';
import clone from 'clone';

const dbCache = {};
let clientStarted = false;
const tinyDB = {
  // Default
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

  // Start
  startClient: async () => {
    if (!clientStarted) {
      // Confirm
      clientStarted = true;

      // ENV Data
      await tinyDB.run(
        `
        CREATE TABLE IF NOT EXISTS envData (
            id VARCHAR(20),
            unix BIGINT,
            value TEXT,
            PRIMARY KEY (id)
        );
    `,
      );

      // History
      await tinyDB.run(
        `
        CREATE TABLE IF NOT EXISTS room_events (
            id TEXT,
            event_id TEXT,
            room_id TEXT,
            thread_id TEXT,
            thread_root_id TEXT,
            type TEXT,
            sender TEXT,
            origin_server_ts BIGINT,
            is_redaction BOOLEAN,
            unsigned JSON,
            content JSON,
            PRIMARY KEY (id)
        );
    `,
      );
    }
  },

  // Ping
  runPing: () =>
    new Promise((resolve, reject) => {
      const id = generateApiKey();
      dbCache[id] = { resolve, reject };
      ipcRenderer.send('requestDBPing', id);
    }),
};

contextBridge.exposeInMainWorld('tinyDB', tinyDB);

/*
    clearData
    clearCacheData
*/

ipcRenderer.on('requestDB', (event, result) => {
  if (dbCache[result.id]) {
    if (typeof result.err !== 'undefined') {
      const err = clone(result.err);
      const error = new Error(err.message);
      error.code = err.code;
      error.stack = err.stack;
      error.errno = err.errno;
      dbCache[result.id].reject(error);
    } else dbCache[result.id].resolve(clone(result.result));
    delete dbCache[result.id];
  }
});
