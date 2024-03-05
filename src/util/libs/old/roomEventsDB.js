import clone from 'clone';
import moment from 'moment-timezone';
import initMatrix from '@src/client/initMatrix';
import { objType } from '../../tools';
import envAPI from '../env';

// Anti Lag
const delayCache = {
  count: 0,
  waiting: false,
  wait: (timeout = 500) =>
    new Promise((resolve) => {
      const waiting = clone(delayCache.waiting);
      delayCache.waiting = true;
      setTimeout(() => {
        if (!waiting) {
          delayCache.count--;
        } else {
          delayCache.count++;
        }

        delayCache.waiting = false;
        resolve();
      }, timeout);
    }),
};

// Functions
export function canUseRoomEventsDB() {
  return (
    __ENV_APP__.ELECTRON_MODE && envAPI.get('SAVE_ROOM_DB') && typeof global.tinyDB !== 'undefined'
  );
}

export function loadRoomEventsDB(data) {
  return new Promise((resolve, reject) => {
    if (objType(data, 'object')) {
      if (canUseRoomEventsDB()) {
        const selector = {};

        // Get Values
        let whereData = '';
        if (typeof data.roomId === 'string') {
          selector.$room_id = data.roomId;
          whereData += 'room_id=$room_id';
        }

        if (typeof data.threadId === 'string') {
          selector.$thread_id = data.threadId;
          if (whereData) whereData += ' AND ';
          whereData += 'thread_id=$thread_id';
        }

        if (typeof data.sender === 'string') {
          selector.$sender = data.sender;
          if (whereData) whereData += ' AND ';
          whereData += 'sender=$sender';
        }

        if (typeof data.type === 'string') {
          selector.$type = data.type;
          if (whereData) whereData += ' AND ';
          whereData += 'type=$type';
        }

        if (typeof data.threadRootId === 'string') {
          selector.$thread_root_id = data.threadRootId;
          if (whereData) whereData += ' AND ';
          whereData += 'thread_root_id=$thread_root_id';
        }

        if (typeof data.isRedaction === 'boolean') {
          selector.$is_redaction = data.isRedaction;
          if (whereData) whereData += ' AND ';
          whereData += 'is_redaction=$is_redaction';
        }

        if (typeof data.after === 'number') {
          selector.$after = data.after;
          if (whereData) whereData += ' AND ';
          whereData += 'origin_server_ts > $after';
        }

        if (typeof data.before === 'number') {
          selector.$before = data.before;
          if (whereData) whereData += ' AND ';
          whereData += 'origin_server_ts < $before';
        }

        let orderType = 'DESC';
        if (typeof data.orderType === 'string' && data.orderType === 'ASC')
          orderType = data.orderType;

        // Detect Mode
        const isPagination =
          typeof data.page === 'number' &&
          data.page > 0 &&
          typeof data.limit === 'number' &&
          data.limit > 0;

        // Pagination Mode
        if (isPagination) {
          selector.$skip = Number(data.page - 1) * data.limit;
        }

        // Limit Mode
        if (typeof data.limit === 'number') selector.$limit = data.limit;

        const query = `SELECT * FROM room_events${whereData ? ` WHERE ${whereData}` : ''}
        ORDER BY origin_server_ts ${orderType}
        ${typeof data.limit === 'number' ? 'LIMIT $limit' : ''}
        ${isPagination ? 'OFFSET $skip' : ''}
        `;

        global.tinyDB
          .all(query, selector)
          .then((result) => {
            const finalData = [];

            for (const item in result) {
              const newData = {};
              newData.eventId = result[item].event_id;
              newData.isRedaction = !!result[item].is_redaction;
              newData.originServerTs = result[item].origin_server_ts;
              newData.momentTs = moment(result[item].origin_server_ts);
              newData.roomId = result[item].room_id;
              newData.sender = result[item].sender;
              newData.threadId = result[item].thread_id;
              newData.threadRootId = result[item].thread_root_id;
              newData.type = result[item].type;

              try {
                newData.content = JSON.parse(result[item].content);
              } catch {
                newData.content = {};
              }

              try {
                newData.unsigned = JSON.parse(result[item].unsigned);
              } catch {
                newData.unsigned = {};
              }

              finalData.unshift(newData);
            }

            resolve(finalData);
          })
          .catch(reject);
      } else {
        reject(new Error('RoomEventsDB is disabled.'));
      }
    } else {
      reject(new Error('Invalid object type.'));
    }
  });
}

export function insertIntoRoomEventsDB(event, needsDecrypt = false) {
  return new Promise((resolve, reject) => {
    if (canUseRoomEventsDB()) {
      const insertEvent = async () => {
        if (delayCache.count < 1) {
          delayCache.count++;
          const thread = event.getThread();
          const unsigned = event.getUnsigned();

          const data = {
            $id: `${event.getRoomId()}${thread && typeof thread.id === 'string' ? `:${thread.id}` : ''}:${event.getId()}`,
            $event_id: event.getId(),
            $room_id: event.getRoomId(),
            $thread_id: thread && typeof thread.id === 'string' ? thread.id : null,
            $thread_root_id: thread && thread.rootEvent ? thread.rootEvent.getId() : null,
            $type: event.getType(),
            $sender: event.getSender(),
            $origin_server_ts: event.getTs(),
            $is_redaction: event.isRedaction(),
            $unsigned: objType(unsigned, 'object') ? JSON.stringify(unsigned) : null,
            $content: JSON.stringify(event.getContent()),
          };

          return global.tinyDB.run(
            `INSERT OR REPLACE INTO room_events (
                    id,
                    event_id,
                    room_id,
                    thread_id,
                    thread_root_id,
                    type,
                    sender,
                    origin_server_ts,
                    is_redaction,
                    unsigned,
                    content
                ) VALUES(
                    $id,
                    $event_id,
                    $room_id,
                    $thread_id,
                    $thread_root_id,
                    $type,
                    $sender,
                    $origin_server_ts,
                    $is_redaction,
                    $unsigned,
                    $content
                );`,
            data,
          );
        }

        await delayCache.wait();
        return insertEvent();
      };

      if (!needsDecrypt) insertEvent().then(resolve).catch(reject);
      else if (event.isEncrypted()) {
        event
          .attemptDecryption(initMatrix.matrixClient.getCrypto())
          .then(() => insertEvent())
          .then(resolve)
          .catch(reject);
      } else {
        insertEvent().then(resolve).catch(reject);
      }
    }
  });
}

if (__ENV_APP__.MODE === 'development') {
  global.roomEventsDB = {
    canUse: canUseRoomEventsDB,
    loadData: loadRoomEventsDB,
    insertInto: insertIntoRoomEventsDB,
  };
}
