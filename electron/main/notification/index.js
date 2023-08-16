import fs from 'fs';
import path from 'path';
import notifier from 'node-notifier';
import { app, Notification } from 'electron';
import { fileURLToPath } from 'url';

import deleteAllFilesInDir from '../../fs/deleteAllFilesInDir';
import { objType } from '../../../src/util/tools';

// Insert utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate Folders
const tempFolder = path.join(app.getPath('temp'), './pony-house-matrix');
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
}

const tempFolderNoti = path.join(tempFolder, './notification');
if (!fs.existsSync(tempFolderNoti)) {
    fs.mkdirSync(tempFolderNoti);
}

deleteAllFilesInDir(tempFolderNoti);
const notifications = {};
let win;

// Events
const filterEvent = (event) => {

    const tinyE = {};
    // for (const item in event) {
    //     if (objType(event, 'object')) {
    //         tinyE[item] = event[item];
    //     }
    // }

    return tinyE;

};

notifier.on('click', (notifierObject, options) => {
    win.send('tiny-notification-all', { type: 'click', notifierObject, options });
});

notifier.on('timeout', (notifierObject, options) => {
    win.send('tiny-notification-all', { type: 'timeout', notifierObject, options });
});

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

        notifications[tag].on('failed', (event, error) => win.send('tiny-notification-failed', { tag, event: filterEvent(event), error: { message: error.message, fileName: error.fileName, lineNumber: error.lineNumber } }));
        notifications[tag].on('close', closeNoti);

    },

    // Node Notifier
    notifier: (tag, data, closeNoti, timeout, closeTimeout) => {

        // Clear default timeout
        clearTimeout(closeTimeout);

        notifier.notify({

            appID: 'pony-house-matrix',
            id: tag,

            title: data?.title,
            subtitle: data?.subtitle,
            message: data?.body,
            sound: data?.silent === true ? false : data?.sound ? data.sound : path.join(__dirname, './sounds/notification.ogg'), // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
            icon: data?.icon, // Absolute Path to Triggering Icon
            contentImage: data?.image, // Absolute Path to Attached Image (Content Image)
            open: data?.url, // URL to open on Click
            wait: data?.wait, // Wait for User Action against Notification or times out. Same as timeout = 5 seconds

            timeout: timeout / 1000, // Takes precedence over wait if both are defined.
            time: timeout,

            closeLabel: data?.closeButtonText, // String. Label for cancel button
            actions: data?.actions, // String | Array<String>. Action label or list of labels in case of dropdown
            dropdownLabel: data?.dropdownLabel, // String. Label to be used if multiple actions
            reply: data?.reply // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.

        }, (err, response, metadata) => {

            if (err) {
                win.send('tiny-notification-failed', { tag, error: { message: err } });
            }

            win.send('tiny-notification-all', { type: 'callback', tag, response, metadata });

        });

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
                win.send(`tiny-notification-close${forceClose ? '-timeout' : ''}`, { tag, event: filterEvent(event) });

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

};
