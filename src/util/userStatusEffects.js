import moment from 'moment-timezone';
import initMatrix from '../client/initMatrix';

// Cache Data
const userInteractions = {

    lastTimestamp: {
        value: null,
        interval: null
    },

};

// Last Timestamp
const lastTimestampUpdate = () => {
    userInteractions.lastTimestamp.value = moment().valueOf();
};

const intervalTimestamp = () => {

};

export function getLastTimestamp() { return userInteractions.lastTimestamp; };
export function startLastTimestamp() {

    if (userInteractions.lastTimestamp.interval) {
        clearInterval(userInteractions.lastTimestamp.interval);
        userInteractions.lastTimestamp.interval = null;
    }

    window.addEventListener("mousemove", lastTimestampUpdate, true);
    userInteractions.lastTimestamp.value = moment().valueOf();
    userInteractions.lastTimestamp.interval = setInterval(intervalTimestamp, 1000);

};

export function stopLastTimestamp() {

    window.removeEventListener("mousemove", lastTimestampUpdate, true);
    if (userInteractions.lastTimestamp.interval) {
        clearInterval(userInteractions.lastTimestamp.interval);
        userInteractions.lastTimestamp.interval = null;
    }

    userInteractions.lastTimestamp.value = null;

};

