/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
import clone from 'clone';

import initMatrix from '../../client/initMatrix';
import { getCurrentState } from "../matrixUtil";
import { objType } from '../tools';
// import { getRoomInfo } from '../../app/organisms/room/Room';

// Info
const PIN_LIMIT = 50;
const eventName = 'm.room.pinned_events';

// Get Messages
export function getPinnedMessagesRaw(room, filterLimit = true) {

    // Base
    let result = [];
    const mx = initMatrix.matrixClient;

    try {

        // Get Status
        const pinEvent = typeof room !== 'string' ?
            getCurrentState(room).getStateEvents(eventName) :
            getCurrentState(mx.getRoom(room)).getStateEvents(eventName) ?? [];

        // Get Content
        if (Array.isArray(pinEvent) && pinEvent[0]) {

            const pinData = pinEvent[0].getContent();
            if (objType(pinData, 'object') && Array.isArray(pinData.pinned)) {
                result = clone(pinData.pinned);
            }

        }

        // Filter event amount
        if (filterLimit && result.length > PIN_LIMIT) {
            while (result.length > PIN_LIMIT) {
                result.shift();
            }
        }

    }

    // Error
    catch (err) {
        console.error(err);
        alert(err.message);
        result = [];
    }

    // Complete
    return result;

};

// Perm checker
export function canPinMessage(room, userId) {
    return getCurrentState(room).maySendStateEvent(eventName, userId);
}

// Get pin messages list
export async function getPinnedMessages(room, filterLimit = true) {

    // Get List
    const pinnedEventsId = getPinnedMessagesRaw(room, filterLimit);
    try {

        // Get events
        for (const item in pinnedEventsId) {
            if (typeof pinnedEventsId[item] === 'string') {
                pinnedEventsId[item] = await room.findEventById(pinnedEventsId[item]);
                // const tinyTimeline = room.getTimelineForEvent
                // tinyTimeline.getEvents();
            }
        }

    }

    // Error warn
    catch (err) {
        console.error(err);
        alert(err.message);
        return [];
    }

    // Complete
    return pinnedEventsId;

};

// Set Pin to message
export function setPinMessage(room, newEventsId, isPinned = true) {
    return new Promise(async (resolve, reject) => {

        // Base
        const mx = initMatrix.matrixClient;

        // Perm validator
        if (canPinMessage(room, mx.getUserId())) {
            try {

                // Get List
                const eventsId = getPinnedMessagesRaw(room);
                const eventsIdOld = getPinnedMessagesRaw(room);
                if (typeof newEventsId === 'string' && newEventsId.length > 0) {

                    // Add data
                    if (isPinned) {
                        const event = await room.findEventById(newEventsId);
                        if (event) {
                            eventsId.push(newEventsId);
                        }
                    }

                    // Remove data
                    else {
                        const index = eventsId.indexOf(newEventsId);
                        if (index > -1) {
                            eventsId.splice(index, 1);
                        }
                    }

                }

                // Validator
                if (
                    ((isPinned && eventsId.length > eventsIdOld.length) || (!isPinned && eventsId.length < eventsIdOld.length)) &&
                    eventsId.length <= PIN_LIMIT
                ) {

                    // Prepare event
                    const data = { pinned: eventsId };

                    // Send Event
                    mx.sendStateEvent(room.roomId, eventName, data).then((event) => {
                        mx.sendEvent(room.roomId, eventName, data).then((msg) => {
                            resolve({ event, msg });
                        }).catch(reject);
                    }).catch(reject);

                }

                // Nope
                else {
                    resolve(null);
                }

            }

            // Error
            catch (err) {
                reject(err);
            }

        }

        // No Permission
        else {
            reject(new Error('No pin message permission!'));
        }

    });
};

// DEV
if (__ENV_APP__.mode === 'development') {
    global.pinManager = {
        getRaw: getPinnedMessagesRaw,
        get: getPinnedMessages,
        set: setPinMessage,
    };
}