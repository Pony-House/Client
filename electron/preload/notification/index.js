import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';

class MyEmitter extends EventEmitter { }

const notifications = {};

ipcRenderer.on('tiny-notification-create-confirm', (_event, arg) => {
    if (notifications[arg.tag] && !notifications[arg.tag].validated && typeof notifications[arg.tag].resolve === 'function') {

        notifications[arg.tag].validated = true;

        notifications[arg.tag].event.show = () => ipcRenderer.send('tiny-notification-show', arg.tag);
        notifications[arg.tag].event.close = () => ipcRenderer.send('tiny-notification-close', arg.tag);

        notifications[arg.tag].resolve(notifications[arg.tag].event);

    }
});

ipcRenderer.on('tiny-notification-close', (_event, arg) => {
    if (notifications[arg.tag]) {
        if (notifications[arg.tag].event) delete notifications[arg.tag].event;
        delete notifications[arg.tag];
    };
});

ipcRenderer.on('tiny-notification-show', (_event, arg) => {
    if (notifications[arg.tag].event) notifications[arg.tag].event.emit('show', arg.event);
});

ipcRenderer.on('tiny-notification-click', (_event, arg) => {
    if (notifications[arg.tag].event) notifications[arg.tag].event.emit('click', arg.event);
});

ipcRenderer.on('tiny-notification-reply', (_event, arg) => {
    if (notifications[arg.tag].event) notifications[arg.tag].event.emit('reply', arg.event, arg.reply);
});

ipcRenderer.on('tiny-notification-action', (_event, arg) => {
    if (notifications[arg.tag].event) notifications[arg.tag].event.emit('action', arg.event, arg.index);
});

ipcRenderer.on('tiny-notification-failed', (_event, arg) => {
    if (notifications[arg.tag].event) notifications[arg.tag].event.emit('failed', arg.event, arg.error);
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
