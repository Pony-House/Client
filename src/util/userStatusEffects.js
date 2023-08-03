import initMatrix from '../client/initMatrix';
import tinyAPI from './mods';

// Cache Data
const userInteractions = {

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

// Interval
const intervalTimestamp = () => {

    // API
    const counter = getUserAfk();
    tinyAPI.emit('afkTimeCounter', counter);

    // 10 Minutes later...
    if (counter > 600) {

    }

    // Nope
    else {

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

