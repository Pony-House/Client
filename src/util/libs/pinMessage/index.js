/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
import clone from 'clone';

import initMatrix from '../../../client/initMatrix';
import { getCurrentState } from "../../matrixUtil";
import { btModal, objType } from '../../tools';

import { setLoadingPage } from "../../../app/templates/client/Loading";
import { twemojify } from "../../twemojify";
import { getRoomInfo } from '../../../app/organisms/room/Room';

import { openProfileViewer, selectRoom } from '../../../client/action/navigation';
import defaultAvatar from '../../../app/atoms/avatar/defaultAvatar';
import { colorMXID } from '../../colorMXID';
import { createMessageData, isEmojiOnly, messageDataEffects } from '../../../app/molecules/message/Message';
import { jqueryTime } from '../../../app/atoms/time/Time';

import { getEventById } from './cache';

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
            try {
                if (typeof pinnedEventsId[item] === 'string') {
                    const eventId = clone(pinnedEventsId[item]);
                    pinnedEventsId[item] = await getEventById(room, eventId);
                    if (pinnedEventsId[item] === null) pinnedEventsId[item] = eventId;
                    // const tinyTimeline = room.getTimelineForEvent
                    // tinyTimeline.getEvents();
                }
            } catch (err) {
                console.error(err);
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
        const isCustomHTML = true;
        let modal = null;

        for (const item in events) {
            try {
                if (objType(events[item], 'object')) {

                    // Prepare Data
                    const userId = events[item].getSender();
                    const userColor = colorMXID(userId);
                    const user = mx.getUser(userId);

                    const thread = events[item].getThread();
                    const roomId = room.roomId;
                    const threadId = thread && typeof thread.id === 'string' ? thread.id : null;

                    const eventId = events[item].getId();

                    const tinyUsername = twemojify(user.userId);

                    const imageSrc = user ? mx.mxcUrlToHttp(user.avatarUrl, 36, 36, 'crop') : null;

                    const content = events[item].getContent();
                    const msgBody = typeof content.formatted_body === 'string' ? content.formatted_body : content.body;

                    let msgData = createMessageData(content, msgBody, isCustomHTML, false, true);
                    // const msgDataReact = createMessageData(content, msgBody, isCustomHTML, false);
                    // const emojiOnly = isEmojiOnly(msgDataReact);

                    const emojiOnly = false;

                    if (!isCustomHTML) {
                        // If this is a plaintext message, wrap it in a <p> element (automatically applying
                        // white-space: pre-wrap) in order to preserve newlines
                        msgData = $('<p>', { class: 'm-0' }).append(msgData);
                    } else {
                        msgData = $('<span>', { class: 'custom-html' }).append(msgData);
                    }

                    messageDataEffects(msgData);

                    // Insert Body
                    body.push($('<tr>', { eventid: eventId, class: 'message message--body-only user-you-message chatbox-portable' }).append(

                        // Avatar
                        $('<td>', { class: 'p-0 ps-2 ps-md-4 py-1 pe-md-2 align-top text-center chat-base avatar-container' }).append($('<button>').on('click', () => openProfileViewer(userId, roomId)).append(
                            $('<img>', { class: 'avatar-react', draggable: false, src: imageSrc !== null ? imageSrc : defaultAvatar(userColor), alt: 'avatar' }).on('load', (event) => {
                                const e = event.originalEvent;
                                e.target.style.backgroundColor = 'transparent';
                            }).on('error', (event) => {
                                const e = event.originalEvent;
                                e.target.src = ImageBrokenSVG;
                            })
                        )),

                        // Message
                        // eslint-disable-next-line no-loop-func
                        $('<td>', { class: 'p-0 pe-3 py-1 message-open-click' }).on('click', () => {

                            const roomTimeline = getRoomInfo().roomTimeline;

                            if (typeof threadId === 'string') {
                                if (threadId !== roomTimeline.threadId) selectRoom(thread.roomId, eventId, thread.rootEvent?.getId());
                            } else if (roomTimeline.room.roomId !== roomId || roomTimeline.threadId) {
                                selectRoom(roomId, eventId);
                            }

                            setTimeout(() => roomTimeline.loadEventTimeline(eventId), 500);
                            if (modal) modal.hide();

                        }).append(
                            $('<div>', { class: 'mb-1' }).append(

                                $('<span>', { class: 'username-base emoji-size-fix' }).css('color', userColor).append(
                                    $('<span>', { class: 'user-id' }).append(tinyUsername)
                                ),

                                $('<span>', { class: 'ms-2 very-small text-gray' }).append(jqueryTime(events[item].getTs()))

                            ),
                            $('<div>', { class: `text-freedom message-body small text-bg${!emojiOnly ? ' emoji-size-fix' : ''}` }).append(msgData)
                        ),

                    ));

                }
            } catch (err) {
                console.error(err);
            }
        }

        // Empty List
        if (body.length < 1) {
            body.push($('<tr>', { class: 'message message--body-only user-you-message chatbox-portable' }).append(
                $('<td>', { class: 'p-0 pe-3 py-1 text-center text-bg-force small', colspan: 2 }).text('This room doesn\'t have any pinned message... yet.')
            ));
        }

        // Send Modal
        modal = btModal({

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
        openModal: openPinMessageModal,
        getRaw: getPinnedMessagesRaw,
        getAll: getPinnedMessages,
        get: getPinnedMessage,
        isPinned: isPinnedMessage,
        set: setPinMessage,
    };
}