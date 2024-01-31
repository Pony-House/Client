// import { MatrixEvent } from 'matrix-js-sdk';
import moment from 'moment-timezone';

import { objType } from '../../tools';
import initMatrix, { fetchFn } from '../../../client/initMatrix';

class ThreadsList {

    constructor(roomId) {
        this.mx = initMatrix.matrixClient;
        this.roomId = typeof roomId === 'string' ? roomId : null;
        this.nextBatch = null;
    }

    setRoomId(roomId) {
        this.roomId = typeof roomId === 'string' ? roomId : null;
    }

    /**
     * https://spec.matrix.org/v1.9/client-server-api/#get_matrixclientv1roomsroomidthreads
     * 
     * @param {string} roomId room id
     * @param {object} config 
     * @param {object} config.filter search filter.  default={"lazy_load_members":true}
     * @param {string} config.from A pagination token from a previous result. When not provided, the server starts paginating from the most recent event visible to the user (as per history visibility rules; topologically).
     * @param {'b' | 'f'} config.dir direction to load. default=b 
     * @param {'all' | 'participated'} config.include Optional (default all) flag to denote which thread roots are of interest to the caller. When all, all thread roots found in the room are returned. When participated, only thread roots for threads the user has participated in will be returned. default=all
     * @param {number} config.limit Optional limit for the maximum number of thread roots to include per response. Must be an integer greater than zero. Servers should apply a default value, and impose a maximum value to avoid resource exhaustion. default=30
     * @return {Promise<object>} the thread list result.
     * 
    */
    get(config = {}) {
        const tinyThis = this;
        return new Promise((resolve, reject) => {
            fetchFn(`${tinyThis.mx.baseUrl}/_matrix/client/v1/rooms/${encodeURIComponent(tinyThis.roomId)}/threads?limit=${typeof config.limit === 'number' ? encodeURIComponent(String(config.limit)) : '30'}${typeof config.from === 'string' ? `&from=${encodeURIComponent(config.from)}` : ''}&dir=${typeof config.dir === 'string' ? encodeURIComponent(config.dir) : 'b'}&include=${typeof config.include === 'string' ? encodeURIComponent(config.include) : 'all'}&filter=${objType(config.filter, 'object') ? encodeURIComponent(JSON.stringify(config.filter)) : '%7B%22lazy_load_members%22%3Atrue%7D'}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tinyThis.mx.getAccessToken()}`
                },
            }).then(res => res.json()).then(data => {

                const events = [];
                if (config.insertBatch) tinyThis.nextBatch = typeof data.next_batch === 'string' ? data.next_batch : null;

                if (objType(data, 'object' && Array.isArray(data.chunk))) {

                    for (const item in data.chunk) {

                        try {
                            if (objType(data.chunk[item], 'object')) {

                                const ev = data.chunk[item];
                                const tinyItem = {};

                                if (typeof ev.origin_server_ts === 'number') {

                                    if (!config.useMoment) {
                                        tinyItem.age = ev.origin_server_ts;
                                    } else {
                                        tinyItem.age = moment(ev.origin_server_ts);
                                    }

                                }

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
    }

};

export default ThreadsList;
export function openThreadsMessageModal(room) {

};

if (__ENV_APP__.MODE === 'development') {
    global.matrixThreads = {
        ThreadsList,
    };
}