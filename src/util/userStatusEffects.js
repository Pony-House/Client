import initMatrix from '../client/initMatrix';
import { emitUpdateProfile } from '../client/action/navigation';
import tinyAPI from './mods';

// Cache Data
const userInteractions = {

    enabled: false,

    afkTime: {
        value: null,
        interval: null
    },

};

// User AFK

// Update
const lastTimestampUpdate = () => {
    userInteractions.afkTime.value = moment().valueOf();
};

// Get
export function getUserAfk(type = 'seconds') {

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

        // 10 Minutes later...
        if ((content.status === '🟢' || content.status === 'online') && (counter > 600 || content.status === '🟠' || content.status === 'idle')) {
            content.afk = true;
        }

        // Nope
        else {
            content.afk = false;
        }

        if (typeof originalAfk !== 'boolean' || originalAfk !== content.afk) {
            initMatrix.matrixClient.setAccountData('pony.house.profile', content);
            emitUpdateProfile(content);
        }

    }
};

// Start
export function startUserAfk() {

    if (userInteractions.afkTime.interval) {
        clearInterval(userInteractions.afkTime.interval);
        userInteractions.afkTime.interval = null;
    }

    $(window).on("mousemove", lastTimestampUpdate);
    userInteractions.afkTime.value = moment().valueOf();
    userInteractions.afkTime.interval = setInterval(intervalTimestamp, 1000);

};

// Stop
export function stopUserAfk() {

    $(window).on("mousemove", lastTimestampUpdate);
    if (userInteractions.afkTime.interval) {
        clearInterval(userInteractions.afkTime.interval);
        userInteractions.afkTime.interval = null;
    }

    userInteractions.afkTime.value = null;

};

