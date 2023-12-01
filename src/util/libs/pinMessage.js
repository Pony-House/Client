/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
import clone from 'clone';

import initMatrix from '../../client/initMatrix';
import { getCurrentState } from "../matrixUtil";
import { objType } from '../tools';
// import { getRoomInfo } from '../../app/organisms/room/Room';

const eventName = 'm.room.pinned_events';

export function getPinnedMessagesRaw(room) {

    let result = [];
    const mx = initMatrix.matrixClient;

    try {

        const pinEvent = typeof room !== 'string' ?
            getCurrentState(room).getStateEvents(eventName) :
            getCurrentState(mx.getRoom(room)).getStateEvents(eventName) ?? [];

        if (Array.isArray(pinEvent) && pinEvent[0]) {

            const pinData = pinEvent[0].getContent();
            if (objType(pinData, 'object') && Array.isArray(pinData.pinned)) {
                result = pinData.pinned;
            }

        }

    } catch (err) {
        console.error(err);
        alert(err.message);
        result = [];
    }

    return result;

};

export function canPinMessage(room, userId) {
    return getCurrentState(room).maySendStateEvent(eventName, userId);
}

export async function getPinnedMessages(room) {

    const pinnedEventsId = clone(getPinnedMessagesRaw(room));
    try {
        for (const item in pinnedEventsId) {
            if (typeof pinnedEventsId[item] === 'string') {
                pinnedEventsId[item] = await room.findEventById(pinnedEventsId[item]);
                // const tinyTimeline = room.getTimelineForEvent
                // tinyTimeline.getEvents();
            }
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
        return [];
    }

    return pinnedEventsId;

};

export function setPinMessage(room, newEventsId, isPinned = true) {
    return new Promise(async (resolve, reject) => {
        const mx = initMatrix.matrixClient;
        if (canPinMessage(room, mx.getUserId())) {
            try {

                const eventsId = clone(getPinnedMessagesRaw(room));
                const eventsIdOld = clone(getPinnedMessagesRaw(room));
                if (typeof newEventsId === 'string') {
                    if (newEventsId.length > 0) {

                        const event = await room.findEventById(newEventsId);
                        if (event) {
                            eventsId.push(newEventsId);
                        }

                    }
                }

                if (eventsId.length > eventsIdOld.length) {

                    const data = { pinned: eventsId };

                    mx.sendStateEvent(room.roomId, eventName, data).then((event) => {
                        mx.sendEvent(room.roomId, eventName, data).then((msg) => {
                            resolve({ event, msg });
                        }).catch(reject);
                    }).catch(reject);

                } else {
                    resolve(null);
                }

            } catch (err) {
                reject(err);
            }
        } else {
            reject(new Error('No pin message permission!'));
        }
    });
};

if (__ENV_APP__.mode === 'development') {
    global.pinManager = {
        getRaw: getPinnedMessagesRaw,
        get: getPinnedMessages,
        set: setPinMessage,
    };
}