import initMatrix from '@src/client/initMatrix';
import { objType } from '../tools';
import envAPI from './env';

export function canUseRoomEventsDB() {
  return (
    __ENV_APP__.ELECTRON_MODE && envAPI.get('SAVE_ROOM_DB') && typeof global.tinyDB !== 'undefined'
  );
}

export function loadRoomEventsDB() {
  return new Promise((resolve, reject) => {
    if (canUseRoomEventsDB()) {
      const selector = {};

      global.tinyDB
        .all(
          `SELECT * FROM room_events WHERE 
            room_id=$room_id
            room_id=$room_id
            thread_id=$thread_id
            thread_root_id=$thread_root_id;
            `,
          selector,
        )
        .then(resolve)
        .catch(reject);
    } else {
      reject(new Error('RoomEventsDB is disabled.'));
    }
  });
}

export function insertIntoRoomEventsDB(event, needsDecrypt = false) {
  return new Promise((resolve, reject) => {
    if (canUseRoomEventsDB()) {
      const insertEvent = () => {
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
      return;
    }
    reject(new Error('RoomEventsDB is disabled.'));
  });
}

if (__ENV_APP__.MODE === 'development') {
  global.roomEventsDB = {
    canUse: canUseRoomEventsDB,
    insertInto: insertIntoRoomEventsDB,
  };
}
