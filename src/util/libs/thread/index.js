// import { MatrixEvent } from 'matrix-js-sdk';

import { objType } from '../../tools';
import initMatrix, { fetchFn } from '../../../client/initMatrix';

/**
 * @param {string} roomId room id
 * @param {object} config 
 * @param {object} config.filter search filter.  default={"lazy_load_members":true}
 * @param {'b' | 'f'} config.dir direction to load. default=b 
 * @param {'all' | 'participated'} config.include include stuff. default=all
 * @param {number} config.limit type of action. default=30
 * @return {Promise<object>} the thread list result.
 */

export function getThreadsFromRoom(roomId, config = {}) {
    const mx = initMatrix.matrixClient;
    return new Promise((resolve, reject) => {
        fetchFn(`${mx.baseUrl}/_matrix/client/v1/rooms/${encodeURIComponent(roomId)}/threads?limit=${typeof config.limit === 'number' ? String(config.limit) : '30'}&dir=${typeof config.dir === 'string' ? config.dir : 'b'}&include=${typeof config.include === 'string' ? config.include : 'all'}&filter=${objType(config.filter, 'object') ? encodeURIComponent(JSON.stringify(config.filter)) : '%7B%22lazy_load_members%22%3Atrue%7D'}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mx.getAccessToken()}`
            },
        }).then(res => res.json()).then(data => {

            const events = [];

            if (objType(data, 'object' && Array.isArray(data.chunk))) {

                for (const item in data.chunk) {

                    try {
                        if (objType(data.chunk[item], 'object')) {

                            const ev = data.chunk[item];
                            const tinyItem = {};

                            if (typeof ev.origin_server_ts === 'number') tinyItem.age = ev.origin_server_ts;
                            if (objType(ev.content, 'object')) tinyItem.content = ev.content;
                            if (typeof ev.event_id === 'string') tinyItem.eventId = ev.event_id;
                            if (typeof ev.room_id === 'string') tinyItem.roomId = ev.room_id;
                            if (typeof ev.sender === 'string') tinyItem.senderId = ev.sender;
                            if (typeof ev.type === 'string') tinyItem.type = ev.type;
                            if (objType(ev.unsigned, 'object')) tinyItem.unsigned = ev.unsigned;

                            /* events.push(new MatrixEvent({
                                origin_server_ts: ev.origin_server_ts,
                                content: ev.content,
                                event_id: ev.event_id,
                                room_id: ev.room_id,
                                sender: ev.sender,
                                user_id: ev.user_id,
                                type: ev.type,
                                unsigned: ev.unsigned,
                            })); */

                            events.push(tinyItem);

                        }
                    } catch (err) {
                        console.error(err);
                    }

                }

            }

            resolve(events);

        }).catch(reject);
    });
};

export function openThreadsMessageModal(room) {

};

if (__ENV_APP__.MODE === 'development') {
    global.matrixThreads = {
        get: getThreadsFromRoom,
    };
}