import { objType } from '../../../src/util/tools';
import { app, Notification } from 'electron';
import fs from 'fs';
import path from 'path';

const tempFolder = path.join(app.getPath('temp'), './pony-house-matrix');
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
}

const tempFolderNoti = path.join(tempFolder, './notification');
if (!fs.existsSync(tempFolderNoti)) {
    fs.mkdirSync(tempFolderNoti);
}

// Module
const notifications = {};
export default function startNotifications(ipcMain) {

    // Create Start
    const createNotification = (e, data) => {

        // Prepare Data
        const tinyData = {};
        const tag = data.tag;
        for (const item in data) {
            if (item !== 'tag') {
                tinyData[item] = data[item];
            }
        }

        // Create Item
        notifications[tag] = new Notification(tinyData);

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

        const closeNoti = (event) => {
            if (notifications[tag]) {

                e.reply('tiny-notification-close', { tag, event: filterEvent(event) });

                if (data.iconFromWeb && typeof data.iconFile === 'string') {

                    const filePath = path.join(tempFolderNoti, `./${data.iconFile}`);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                }

                delete notifications[tag];

            }
        };

        // Show
        notifications[tag].on('show', (event) => {
            e.reply('tiny-notification-show', { tag, event: filterEvent(event) });
        });

        // Click
        notifications[tag].on('click', (event) => {
            e.reply('tiny-notification-click', { tag, event: filterEvent(event) });
        });

        // Reply
        notifications[tag].on('reply', (event, reply) => {
            e.reply('tiny-notification-reply', { tag, event: filterEvent(event), reply });
        });

        // Action
        notifications[tag].on('action', (event, index) => {
            e.reply('tiny-notification-action', { tag, event: filterEvent(event), index });
        });

        // Failed
        notifications[tag].on('failed', (event, error) => {
            e.reply('tiny-notification-failed', { tag, event: filterEvent(event), error });
        });

        // Close
        notifications[tag].on('close', closeNoti);

        e.reply('tiny-notification-create-confirm', { tag, isSupported: Notification.isSupported() });

    };

    // Create
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

            createNotification(e, data);

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
