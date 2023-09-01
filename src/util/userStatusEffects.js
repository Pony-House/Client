import { App } from '@capacitor/app';
import initMatrix from '../client/initMatrix';
import { emitUpdateProfile } from '../client/action/navigation';
import tinyAPI from './mods';
import { countObj } from './tools';

// Cache Data
const userInteractions = {

    enabled: false,
    mobile: {
        isActive: true,
    },

    vc: {
        isActive: false,
    },

    afkTime: {
        value: null,
        interval: null
    },

};

// Mobile
App.addListener('appStateChange', ({ isActive }) => {
    userInteractions.mobile.isActive = isActive;
});

// User AFK

// Update
const lastTimestampUpdate = () => {
    userInteractions.afkTime.value = moment().valueOf();
};

// Voice Chat Mode
export function setVoiceChatMode(value = true) {
    if (typeof value === 'boolean') userInteractions.vc.isActive = value;
};

// Get
export function getUserAfk(type = 'seconds') {

    if (__ENV_APP__.electron_mode && global.systemIdleTime?.get) {
        global.systemIdleTime.exec();
        return global.systemIdleTime.get();
    }

    if (typeof userInteractions.afkTime.value === 'number') {
        return moment().diff(userInteractions.afkTime.value, type);
    }

    return null;

};

export function enableAfkSystem(value = true) {
    if (typeof value === 'boolean') userInteractions.enabled = value;
};

// Interval
const intervalTimestamp = () => {
    if (userInteractions.enabled) {

        // API
        const counter = getUserAfk();
        tinyAPI.emit('afkTimeCounter', counter);
        const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};
        const originalAfk = content.afk;
        if (countObj(content) > 0) {

            tinyAPI.emit('afkTimeCounterProgress', counter);

            // 10 Minutes later...
            if (
                !userInteractions.vc.isActive &&
                (content.status === '🟢' || content.status === 'online') &&
                (counter > 600 || content.status === '🟠' || content.status === 'idle' || !userInteractions.mobile.isActive)
            ) {
                content.afk = true;
            }

            // Nope
            else {
                content.afk = false;
            }

            if (typeof originalAfk !== 'boolean' || originalAfk !== content.afk) {
                tinyAPI.emit('afkTimeCounterUpdated', counter);
                initMatrix.matrixClient.setAccountData('pony.house.profile', content);
                emitUpdateProfile(content);
            }

        }

    }
};

// Start
export function startUserAfk() {

    if (userInteractions.afkTime.interval) {
        clearInterval(userInteractions.afkTime.interval);
        userInteractions.afkTime.interval = null;
    }

    if (!__ENV_APP__.electron_mode) {
        $(window).on("mousemove", lastTimestampUpdate);
        userInteractions.afkTime.value = moment().valueOf();
    }

    userInteractions.afkTime.interval = setInterval(intervalTimestamp, 1000);

};

// Stop
export function stopUserAfk() {

    if (!__ENV_APP__.electron_mode) $(window).on("mousemove", lastTimestampUpdate);
    if (userInteractions.afkTime.interval) {
        clearInterval(userInteractions.afkTime.interval);
        userInteractions.afkTime.interval = null;
    }

    if (!__ENV_APP__.electron_mode) userInteractions.afkTime.value = null;

};

