import { objType } from '../../../src/util/tools';
import { Notification } from 'electron';

// Module
const notifications = {};
export default function startNotifications(ipcMain) {

    // Create
    ipcMain.on('tiny-notification-create', (e, data) => {

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

        // Show
        notifications[tag].on('show', (event) => {
            e.reply('tiny-notification-show', { tag, event: filterEvent(event) });
        });

        // Click
        notifications[tag].on('click', (event) => {
            e.reply('tiny-notification-click', { tag, event: filterEvent(event) });
        });

        // Close
        notifications[tag].on('close', (event) => {
            e.reply('tiny-notification-close', { tag, event: filterEvent(event) });
            if (notifications[tag]) delete notifications[tag];
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

        e.reply('tiny-notification-create-confirm', { tag, isSupported: Notification.isSupported() });

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
