import fs from 'fs';
import path from 'path';
import { Notification } from 'electron';

import deleteAllFilesInDir from '../../fs/deleteAllFilesInDir';
import { objType } from '../../../src/util/tools';
import { tempFolderNoti } from '../tempFolders';

deleteAllFilesInDir(tempFolderNoti);
const notifications = {};
let win;

// Events
const filterEvent = () => {
  const tinyE = {};
  // for (const item in event) {
  //     if (objType(event, 'object')) {
  //         tinyE[item] = event[item];
  //     }
  // }

  return tinyE;
};

// Engines
const engines = {
  // Electron
  default: (tag, data, closeNoti) => {
    notifications[tag] = new Notification(data);

    notifications[tag].on('show', (event) => {
      const newEvent = filterEvent(event);
      win.send('tiny-notification-show', { tag, event: newEvent });
      win.send('tiny-notification-all', { type: 'show', tag, event: newEvent });
    });

    notifications[tag].on('click', (event) => {
      const newEvent = filterEvent(event);
      win.send('tiny-notification-click', { tag, event: newEvent });
      win.send('tiny-notification-all', { type: 'click', tag, event: newEvent });
    });

    notifications[tag].on('reply', (event, reply) => {
      const newEvent = filterEvent(event);
      win.send('tiny-notification-reply', { tag, event: newEvent, reply });
      win.send('tiny-notification-all', { type: 'reply', tag, event: newEvent, reply });
    });

    notifications[tag].on('action', (event, index) => {
      const newEvent = filterEvent(event);
      win.send('tiny-notification-action', { tag, event: newEvent, index });
      win.send('tiny-notification-all', { type: 'action', tag, event: newEvent, index });
    });

    notifications[tag].on('failed', (event, error) =>
      win.send('tiny-notification-failed', {
        tag,
        event: filterEvent(event),
        error: { message: error.message, fileName: error.fileName, lineNumber: error.lineNumber },
      }),
    );
    notifications[tag].on('close', closeNoti);
  },
};

// Create Start
const createNotification = (data) => {
  // Prepare Data
  const tinyData = {};
  const tag = data.tag;
  let timeout = data.timeout;
  for (const item in data) {
    if (item !== 'tag' && item !== 'timeout') {
      tinyData[item] = data[item];
    }
  }

  if (typeof timeout !== 'number' || Number.isNaN(timeout) || !Number.isFinite(timeout)) {
    timeout = 15000;
  } else if (timeout < 0) {
    timeout = 0;
  }

  // Close Event
  const closeNoti = (event, forceClose) => {
    try {
      if (notifications[tag]) {
        delete notifications[tag];
        win.send(`tiny-notification-close${forceClose ? '-timeout' : ''}`, {
          tag,
          event: filterEvent(event),
        });

        if (data.iconFromWeb && typeof data.iconFile === 'string') {
          const filePath = path.join(tempFolderNoti, `./${data.iconFile}`);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Select Engine
  const closeTimeout = setTimeout(() => closeNoti({}, true), timeout);
  if (typeof data.engine !== 'string' || !engines[data.engine]) {
    engines.default(tag, tinyData, closeNoti);
  } else {
    const engine = data.engine;
    delete data.engine;
    engines[engine](tag, tinyData, closeNoti, timeout, closeTimeout);
  }

  // Send Confirm
  win.send('tiny-notification-create-confirm', { tag, isSupported: Notification.isSupported() });
};

// Module
export default function startNotifications(ipcMain, newWin) {
  // Create
  win = newWin;
  ipcMain.on('tiny-notification-create', (e, data) => {
    if (objType(data, 'object') && typeof data.tag === 'string') {
      // Is Data Cache
      if (data.icon.startsWith('data:image/')) {
        const base64File = data.icon.split(';base64,');
        const ext = base64File[0].split('data:image/')[1];

        const filename = `${data.tag.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
        const tempFile = path.join(tempFolderNoti, `./${filename}`);

        const binaryString = atob(base64File[1]);
        fs.writeFileSync(tempFile, binaryString, 'binary');

        data.iconFile = filename;
        data.icon = tempFile;
        data.iconFromWeb = true;
      } else {
        data.iconFromWeb = false;
      }

      createNotification(data);
    }
  });

  // Show
  ipcMain.on('tiny-notification-show', (event, tag) => {
    if (notifications[tag] && typeof notifications[tag].show === 'function') {
      notifications[tag].show();
    }
  });

  // Hide
  ipcMain.on('tiny-notification-close', (event, tag) => {
    if (notifications[tag] && typeof notifications[tag].close === 'function') {
      notifications[tag].close();
    }
  });
}
