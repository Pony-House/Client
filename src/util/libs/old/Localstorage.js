import { openDB } from 'idb';

// https://web.dev/articles/indexeddb?hl=pt-br#versioning
// https://web.dev/articles/indexeddb?hl=pt-br#stores

export const startPonyHouseDb = async () => {
  this.db = await openDB(this.dbName, this._dbVersion, {
    async upgrade(db, oldVersion) {
      const version0 = () => {
        console.log('[indexedDb] Version detected - 0');

        // Create a store of objects
        const events = db.createObjectStore('timeline', {
          // The 'id' property of the object will be the key.
          keyPath: 'event_id',
          // If it isn't explicitly set, create a value by auto incrementing.
          // autoIncrement: false,
        });
        // Create an index on the 'date' property of the objects.
        events.createIndex('origin_server_ts', 'origin_server_ts', { unique: false });
        events.createIndex('type', 'type', { unique: false });

        events.createIndex('sender', 'sender', { unique: false });
        events.createIndex('room_id', 'room_id', { unique: false });

        events.createIndex('content', 'content', { unique: false });
        events.createIndex('unsigned', 'unsigned', { unique: false });
      };

      const version1 = async () => {
        // const tx = await db.transaction('timeline', 'readwrite');
        console.log('[indexedDb] Version detected - 1');
      };

      switch (oldVersion) {
        case 0:
          version0();
        case 1:
          await version1();
      }
    },
  });
};

export const addToTimeline = (event) => {
  return new Promise((resolve, reject) => {
    const data = {};
    const tinyReject = (err) => {
      console.log('[indexed-db] ERROR SAVING TIMELINE DATA!', data);
      reject(err);
    };
    try {
      const date = event.getDate();

      data.event_id = event.getId();
      data.type = event.getType();
      data.sender = event.getSender();
      data.room_id = event.getRoomId();
      data.content = event.getContent();
      data.unsigned = event.getUnsigned();
      if (date) data.origin_server_ts = date.getTime();

      const tx = storageManager.db.transaction('timeline', 'readwrite');
      Promise.all([tx.store.put(data), tx.done])
        .then(resolve)
        .catch(tinyReject);
    } catch (err) {
      tinyReject(err);
    }
  });
};
