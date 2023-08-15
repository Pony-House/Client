import { ipcRenderer } from 'electron';

const notifications = {};

ipcRenderer.on('tiny-notification-create', (_event, arg) => {

});

ipcRenderer.on('tiny-notification-show', (_event, arg) => {

});

ipcRenderer.on('tiny-notification-click', (_event, arg) => {

});

ipcRenderer.on('tiny-notification-close', (_event, arg) => {
    if (notifications[arg.tag]) delete notifications[arg.tag];
});

ipcRenderer.on('tiny-notification-reply', (_event, arg) => {

});

ipcRenderer.on('tiny-notification-action', (_event, arg) => {

});

ipcRenderer.on('tiny-notification-failed', (_event, arg) => {

});

// Module
export default function startNotifications(options) {
    return new Promise((resolve, reject) => {

    });
};
