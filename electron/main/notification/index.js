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

        // Show
        notifications[tag].on('show', (event) => {
            event.reply('tiny-notification-show', { tag, event });
        });

        // Click
        notifications[tag].on('click', (event) => {
            event.reply('tiny-notification-click', { tag, event });
        });

        // Close
        notifications[tag].on('close', (event) => {
            event.reply('tiny-notification-close', { tag, event });
            if (notifications[tag]) delete notifications[tag];
        });

        // Reply
        notifications[tag].on('reply', (event, reply) => {
            event.reply('tiny-notification-reply', { tag, event, reply });
        });

        // Action
        notifications[tag].on('action', (event, index) => {
            event.reply('tiny-notification-action', { tag, event, index });
        });

        // Failed
        notifications[tag].on('failed', (event, error) => {
            event.reply('tiny-notification-failed', { tag, event, error });
        });

        e.reply('tiny-notification-create-confirm', { tag });

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
