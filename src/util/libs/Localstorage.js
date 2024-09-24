import EventEmitter from 'events';
import { openDB } from 'idb';

import { objType } from 'for-promise/utils/lib.mjs';

class StorageManager extends EventEmitter {
  constructor() {
    super();
    this.isPersisted = null;
    this._dbVersion = 1;
    this.dbName = 'pony-house-database';

    // Get Content
    this.content = this.getJson('ponyHouse-storage-manager', 'obj');
    this.content.isPersistedLocal =
      typeof this.content.isPersistedLocal === 'boolean' ? this.content.isPersistedLocal : true;

    const tinyThis = this;
    window.addEventListener('storage', function (e) {
      tinyThis.emit('storage', e);
    });
  }

  addToTimeline(event) {
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
  }

  async startPonyHouseDb() {
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
  }

  getLocalStorage() {
    return global.localStorage;
  }

  getIndexedDB() {
    return global.indexedDB;
  }

  getIsPersisted() {
    return this.isPersisted;
  }

  getIsPersistedLocal() {
    return this.isPersisted ? this.content.isPersistedLocal : false;
  }

  setIsPersistedLocal(value) {
    if (typeof value === 'boolean') {
      this.content.isPersistedLocal = value;
      this.setJson('ponyHouse-storage-manager', this.content);
      this.emit('isPersistedLocal', value);
    }
  }

  async estimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate();
    }
    return null;
  }

  async checkStoragePersisted() {
    // Check if site's storage has been marked as persistent
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persisted();
    } else this.isPersisted = null;
    return this.isPersisted;
  }

  async requestStoragePersisted() {
    // Request persistent storage for site
    if (navigator.storage && navigator.storage.persist) {
      this.isPersisted = await navigator.storage.persist();
    } else this.isPersisted = null;
    this.emit('isPersisted', this.isPersisted);
    return this.isPersisted;
  }

  localStorageExist() {
    return typeof Storage !== 'undefined';
  }

  setJson(name, data) {
    if (objType(data, 'object') || objType(data, 'map') || Array.isArray(data))
      return global.localStorage.setItem(name, JSON.stringify(data));
    throw new Error('The storage value is not json!');
  }

  getJson(name, defaultData = null) {
    if (
      typeof defaultData !== 'string' ||
      (defaultData !== 'array' &&
        defaultData !== 'obj' &&
        defaultData !== 'map' &&
        defaultData !== 'null')
    ) {
      return JSON.parse(global.localStorage.getItem(name));
    } else {
      let content = global.localStorage.getItem(name);
      const defaultValue =
        defaultData === 'obj'
          ? {}
          : defaultData === 'array'
            ? []
            : defaultData === 'map'
              ? new Map()
              : null;
      try {
        content = JSON.parse(content) ?? defaultValue;
      } catch {
        content = defaultValue;
      }
      return content;
    }
  }

  setItem(name, data) {
    return global.localStorage.setItem(name, data);
  }

  getItem(name) {
    return global.localStorage.getItem(name);
  }

  setString(name, data) {
    if (typeof data === 'string') return global.localStorage.setItem(name, data);
    throw new Error('The storage value is not string!');
  }

  getString(name) {
    let value = global.localStorage.getItem(name);
    if (typeof value === 'string') return value;

    return null;
  }

  setNumber(name, data) {
    if (typeof data === 'number') return global.localStorage.setItem(name, data);
    throw new Error('The storage value is not number!');
  }

  getNumber(name) {
    let number = global.localStorage.getItem(name);
    if (typeof number === 'number') return number;
    if (typeof number === 'string' && number.length > 0) {
      number = Number(number);
      if (!Number.isNaN(number)) return number;
    }

    return null;
  }

  setBool(name, data) {
    if (typeof data === 'boolean') return global.localStorage.setItem(name, data);
    throw new Error('The storage value is not boolean!');
  }

  getBool(name) {
    const value = global.localStorage.getItem(name);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }

    return null;
  }

  removeItem(name) {
    return global.localStorage.removeItem(name);
  }

  clearLocalStorage() {
    global.localStorage.clear();
  }
}

// Functions and class
const storageManager = new StorageManager();
storageManager.setMaxListeners(__ENV_APP__.MAX_LISTENERS);
export default storageManager;

if (__ENV_APP__.MODE === 'development') {
  global.storageManager = storageManager;
}
