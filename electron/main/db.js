import moment from 'moment-timezone';
import sqlite3 from 'sqlite3';

const buildError = (err) => ({
  code: err.code,
  message: err.message,
  stack: err.stack,
  errno: err.errno,
});

export default async function tinyDB(filename, ipcMain, newWin) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(filename);

    const tinyCache = {
      using: false,
      send: [],
    };

    tinyCache.run = (type, value1, value2, rechecking = false) =>
      new Promise((resolve2, reject) => {
        if (!tinyCache.using || rechecking) {
          tinyCache.using = true;
          try {
            db[type](value1, value2, (err, data) => {
              tinyCache.using = false;
              if (!err) resolve2(data);
              else {
                console.error(err);
                reject(buildError(err));
              }
            });
          } catch (err) {
            console.error(err);
            reject(buildError(err));
          }
        } else {
          tinyCache.send.push({ value1, value2, resolve: resolve2, reject, type });
          tinyCache.recheck();
        }
      });

    tinyCache.recheck = () => {
      setTimeout(() => {
        if (!tinyCache.using) {
          // Data
          tinyCache.using = true;
          const newData = tinyCache.send.shift();
          tinyCache
            .run(newData.type, newData.value1, newData.value2, true)
            .then(newData.resolve)
            .catch(newData.reject);
        } else {
          tinyCache.recheck();
        }
      }, 100);
    };

    const result = {
      run: (value1, value2) => tinyCache.run('run', value1, value2),
      all: (value1, value2) => tinyCache.run('all', value1, value2),
      get: (value1, value2) => tinyCache.run('get', value1, value2),
    };

    const ping = () =>
      result
        .run(
          `
          CREATE TABLE IF NOT EXISTS ping (
              id VARCHAR(10),
              unix BIGINT,
              PRIMARY KEY (id)
          );
      `,
        )
        .then(() =>
          result.run(
            `
          INSERT OR REPLACE INTO ping (id, unix) VALUES($id, $unix);
      `,
            {
              $id: 'start',
              $unix: moment().unix(),
            },
          ),
        );

    ping();

    ipcMain.on('requestDB', (event, type, id, value, value2) => {
      if (typeof result[type] === 'function') {
        result[type](value, value2)
          .then((data) => newWin.webContents.send('requestDB', { result: data, id }))
          .catch((err) => newWin.webContents.send('requestDB', { err, id }));
      } else {
        newWin.webContents.send('requestDB', null);
      }
    });

    ipcMain.on('requestDBPing', (event, id) => {
      ping()
        .then((data) => newWin.webContents.send('requestDB', { result: data, id }))
        .catch((err) => newWin.webContents.send('requestDB', { err, id }));
    });

    resolve(result);
  });
}
