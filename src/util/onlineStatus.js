/* eslint-disable prefer-destructuring */

import initMatrix from '../client/initMatrix';

// Status Builder
const statusList = {
    online: 'fa-solid fa-circle',
    offline: 'bi bi-record-circle-fill',
    unavailable: 'bi bi-record-circle-fill',
    dnd: 'fa-solid fa-circle-minus',
    idle: 'fa-solid fa-moon',
};

const statusIcons = {
    online: '🟢',
    offline: '🔘',
    unavailable: '🔘',
    dnd: '🔴',
    idle: '🟠',
};

const statusIcons2 = {};
for (const item in statusIcons) {
    statusIcons2[statusIcons[item]] = item;
}

export function getStatusCSS(presence) {
    if (statusList[presence]) {
        return statusList[presence];
    }
    return null;
}

export function getStatusIcon(presence) {
    if (statusIcons[presence]) {
        return statusIcons[presence];
    }
    return null;
}

export function getStatusIconReverse(presence) {
    if (statusIcons2[presence]) {
        return statusIcons2[presence];
    }
    return null;
}

export function validatorStatusIcon(presence) {
    if (statusIcons2[presence]) {
        return statusIcons2[presence];
    }
    return null;
}

// Parse Status
export function parsePresenceStatus(presence) {
    if (typeof presence === 'string') {

        const mx = initMatrix.matrixClient;
        const tinyResult = { status: null, msg: null, bio: null, banner: null };
        try {
            const tinyParse = JSON.parse(presence);
            if (tinyParse) {

                // Status Profile
                if (typeof tinyParse.status === 'string') {
                    tinyParse.status = tinyParse.status.trim();
                    const validateIcon = validatorStatusIcon(tinyParse.status);
                    if (typeof validateIcon === 'string') {
                        tinyResult.status = validateIcon;
                    }
                }

                // Message
                if (typeof tinyParse.msg === 'string' && tinyParse.msg.length > 0) {
                    tinyResult.msg = tinyParse.msg.substring(0, 100);
                }

                if (typeof tinyParse.banner === 'string' && tinyParse.banner.length > 0) {
                    tinyResult.banner = mx.mxcUrlToHttp(tinyParse.banner);
                }

                // Profile Bio
                if (typeof tinyParse.bio === 'string' && tinyParse.bio.length > 0) {
                    tinyResult.bio = tinyParse.bio.substring(0, 190);
                }

            }
        } catch (err) {
            tinyResult.msg = presence.substring(0, 100);
        }

        return tinyResult;

    }
    return null;
}

// Get Presence Data
export function getPresence(user, canStatus = true, canPresence = true) {

    if (user) {

        const content = {};
        if (!canPresence) content.presenceStatusMsg = null;

        if (canStatus) {
            content.presence = 'offline';
            content.lastActiveAgo = null;
            content.currentlyActive = false;
        }

        if (canStatus && typeof user.presence === 'string') {
            content.presence = user.presence;
        }

        if (canStatus && typeof user.lastActiveAgo === 'number') {
            content.lastActiveAgo = user.lastActiveAgo;
            content.currentlyActive = true;
        }

        if (canPresence && typeof user.presenceStatusMsg === 'string') {
            content.presenceStatusMsg = user.presenceStatusMsg;
        }

        if (typeof content.presenceStatusMsg === 'string') {
            content.presenceStatusMsg = parsePresenceStatus(content.presenceStatusMsg);
            if (content.presence !== 'offline' && content.presence !== 'unavailable' && content.presenceStatusMsg.status) {
                content.presence = content.presenceStatusMsg.status;
                delete content.presenceStatusMsg.status;
            };
        }

        return content;

    }

    return null;

}

// Get Status CSS
export function getUserStatus(user, tinyData) {

    if (user) {

        let data;

        if (!tinyData) {
            data = getPresence(user);
        } else {
            data = tinyData;
        }

        if (data) {

            let presence = data.presence;
            if (statusList[presence]) {
                presence += ` ${statusList[presence]}`;
            }

            return `user-presence-${presence}`;

        }

    }

    return `user-presence-unavailable ${statusList.unavailable}`;

}

// Update Status Icon
export function updateUserStatusIcon(status, user, tinyData, canStatus = true, canPresence = true) {

    let useData;
    if (!tinyData) {
        useData = getPresence(user, canStatus, canPresence);
    }

    for (const item in statusList) {
        status.classList.remove(`user-presence-${item}`);

        const statusClasses = statusList[item].split(' ');
        for (const item2 in statusClasses) {
            status.classList.remove(statusClasses[item2]);
        }

    }

    const newClasses = getUserStatus(user, useData).split(' ');

    for (const item in newClasses) {
        status.classList.add(newClasses[item]);
    }

    return useData;

}