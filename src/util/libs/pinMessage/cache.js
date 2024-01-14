import { MatrixEvent } from 'matrix-js-sdk';
import initMatrix from '../../../client/initMatrix';
import { countObj, objType } from "../../tools";

const tinyCache = {};
setInterval(() => {
    for (const roomId in tinyCache) {
        for (const eventId in tinyCache[roomId]) {

            if (tinyCache[roomId][eventId].timeout > 0) {
                tinyCache[roomId][eventId].timeout--;
            } else {

                delete tinyCache[roomId][eventId];
                if (countObj(tinyCache[roomId]) < 1 && objType(tinyCache[roomId], 'object')) {
                    delete tinyCache[roomId];
                }

            }

        }
    }
}, 60000);

export async function resetEventList() {
    for (const roomId in tinyCache) {

        for (const eventId in tinyCache[roomId]) {

            delete tinyCache[roomId][eventId];
            if (countObj(tinyCache[roomId] && objType(tinyCache[roomId], 'object'))) {
                delete tinyCache[roomId];
            }

        }

        delete tinyCache[roomId];

    }
};

export async function getEventById(room, eventId) {

    if (!objType(tinyCache[room.roomId], 'object')) {
        tinyCache[room.roomId] = {};
    }

    if (!objType(tinyCache[room.roomId][eventId], 'object')) {
        tinyCache[room.roomId][eventId] = { event: null, timeout: 60 };
    }

    if (!tinyCache[room.roomId][eventId].event) {
        tinyCache[room.roomId][eventId].event = await room.findEventById(eventId);
        if (!tinyCache[room.roomId][eventId].event) {

            const newEvent = await initMatrix.matrixClient.fetchRoomEvent(room.roomId, eventId);
            if (newEvent) {

                tinyCache[room.roomId][eventId].event = new MatrixEvent({
                    origin_server_ts: newEvent.age,
                    content: newEvent.content,
                    event_id: eventId,
                    room_id: room.roomId,
                    sender: newEvent.sender,
                    type: newEvent.type,
                    unsigned: newEvent.unsigned,
                });

            } else {
                tinyCache[room.roomId][eventId].event = null;
            }

        }
    }

    return tinyCache[room.roomId][eventId].event;

};