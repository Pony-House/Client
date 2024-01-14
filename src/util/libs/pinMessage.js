/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
import clone from 'clone';

import initMatrix from '../../client/initMatrix';
import { getCurrentState } from "../matrixUtil";
import { btModal, objType } from '../tools';

import { setLoadingPage } from "../../app/templates/client/Loading";
// import { getRoomInfo } from '../../app/organisms/room/Room';

import { openProfileViewer } from '../../client/action/navigation';
import defaultAvatar from '../../app/atoms/avatar/defaultAvatar';
import { colorMXID } from '../colorMXID';

// Info
const ImageBrokenSVG = './img/svg/image-broken.svg';
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
};

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

// Get pinned messages
export function isPinnedMessage(room, eventId, filterLimit = true) {
    const data = getPinnedMessagesRaw(room, filterLimit);
    return Array.isArray(data) && data.length > 0 && data.indexOf(eventId) > -1;
};

export function getPinnedMessage(room, eventId, filterLimit = true) {
    return new Promise((resolve, reject) => {
        if (isPinnedMessage(room, eventId, filterLimit)) {
            room.findEventById(eventId).then(resolve).catch(reject);
        } else {
            resolve(null);
        }
    });
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

// Open Modal
export function openPinMessageModal(room) {
    setLoadingPage();
    getPinnedMessages(room).then(events => {

        // Prepare
        const body = [];
        const mx = initMatrix.matrixClient;

        for (const item in events) {

            // Test
            console.log('----------------------------------');
            console.log(events[item]);
            console.log('date', events[item].getDate());
            console.log('thread', events[item].getThread());
            console.log('content', events[item].getContent());
            console.log('----------------------------------');

            // Prepare Data
            const userId = events[item].getSender();
            const user = mx.getUser(userId);
            const imageSrc = user ? mx.mxcUrlToHttp(user.avatarUrl, 36, 36, 'crop') : null;

            // Insert Body
            body.push($('<tr>', { eventid: events[item].getId(), class: 'message message--body-only user-you-message chatbox-portable' }).append(

                // Avatar
                $('<td>', { class: 'p-0 ps-2 ps-md-4 py-1 pe-md-2 align-top text-center chat-base avatar-container' }).append($('<button>').on('click', () => openProfileViewer(userId, room.roomId)).append(
                    $('<img>', { class: 'avatar-react', draggable: false, src: imageSrc !== null ? imageSrc : defaultAvatar(colorMXID(userId)), alt: 'avatar' }).on('load', (event) => {
                        const e = event.originalEvent;
                        e.target.style.backgroundColor = 'transparent';
                    }).on('error', (event) => {
                        const e = event.originalEvent;
                        e.target.src = ImageBrokenSVG;
                    })
                )),

                // Message
                $('<td>', { class: 'p-0 pe-3 py-1' }).append(
                    $('<div>', { class: 'text-freedom message-body small text-bg emoji-size-fix' }).text(events[item].getId())
                ),

            ));

        }

        // Send Modal
        btModal({

            title: 'Pinned Messages',

            id: 'room-pinned-messages',
            dialog: 'modal-lg modal-dialog-scrollable modal-dialog-centered',
            body: $('<table>', { class: 'table table-borderless table-hover align-middle m-0' }).append($('<tbody>').append(body)),

        });

        // Complete
        setLoadingPage(false);

    }).catch(() => setLoadingPage(false));
};

// DEV
if (__ENV_APP__.MODE === 'development') {
    global.pinManager = {
        getRaw: getPinnedMessagesRaw,
        getAll: getPinnedMessages,
        get: getPinnedMessage,
        isPinned: isPinnedMessage,
        set: setPinMessage,
    };
}