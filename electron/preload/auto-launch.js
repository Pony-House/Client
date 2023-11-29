import { contextBridge } from 'electron';
import AutoLaunch from 'auto-launch';

let tinyModule;
const autoLaunch = {

    started: false,
    start: (name) => {
        if (!tinyModule) {
            tinyModule = new AutoLaunch({
                name,
                path: process.execPath,
            });
        }
    },

    enable: () => tinyModule ? tinyModule.enable() : null,
    disable: () => tinyModule ? tinyModule.disable() : null,
    isEnabled: () => tinyModule ? tinyModule.isEnabled() : null,

};

contextBridge.exposeInMainWorld('autoLaunch', autoLaunch);
export default function startAutoLaunch() { };