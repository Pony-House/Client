import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

class MyEmitter extends EventEmitter { }

const notifications = {};

ipcRenderer.on('tiny-notification-create-confirm', (_event, arg) => {
    if (notifications[arg.tag] && !notifications[arg.tag].validated && typeof notifications[arg.tag].resolve === 'function') {

        notifications[arg.tag].validated = true;
        notifications[arg.tag].resolve({

            isSupported: () => arg.isSupported,

            show: () => ipcRenderer.send('tiny-notification-show', arg.tag),
            close: () => ipcRenderer.send('tiny-notification-close', arg.tag),

            addEventListener: (event, callback) => {
                notifications[arg.tag].event.on(event, callback);
                return true;
            },

            removeEventListener: (event, callback) => {
                notifications[arg.tag].event.off(event, callback);
                return true;
            },

            on: (event, callback) => {
                notifications[arg.tag].event.on(event, callback);
                return true;
            },

            off: (event, callback) => {
                notifications[arg.tag].event.off(event, callback);
                return true;
            },

            once: (event, callback) => {
                notifications[arg.tag].event.once(event, callback);
                return true;
            }

        });

    }
});

ipcRenderer.on('tiny-notification-close', (_event, arg) => {
    if (notifications[arg.tag]) {
        if (notifications[arg.tag].event) {
            notifications[arg.tag].event.emit('close', arg.event);
            delete notifications[arg.tag].event
        };
        delete notifications[arg.tag];
    };
});

ipcRenderer.on('tiny-notification-all', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('all', arg);
});

ipcRenderer.on('tiny-notification-show', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('show', arg.event);
});

ipcRenderer.on('tiny-notification-click', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('click', arg.event);
});

ipcRenderer.on('tiny-notification-reply', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('reply', arg.reply);
});

ipcRenderer.on('tiny-notification-action', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('action', arg.index);
});

ipcRenderer.on('tiny-notification-failed', (_event, arg) => {
    if (notifications[arg.tag]?.event) notifications[arg.tag].event.emit('failed', new Error(arg.error?.message ? arg.error.message : arg.error, arg.error?.fileName, arg.error?.lineNumber));
});

// Module
export default function startNotifications(arg) {
    return new Promise((resolve, reject) => {

        // Exist Tag
        if (arg?.tag) {
            if (!notifications[arg.tag]) {
                notifications[arg.tag] = { validated: false, resolve, reject, event: new MyEmitter() };
                ipcRenderer.send('tiny-notification-create', arg);
            } else {
                reject(new Error('This tag exist.'));
            }
        }

        // Nope
        else {
            reject(new Error('No tag on the notification object.'));
        }

    });
};
