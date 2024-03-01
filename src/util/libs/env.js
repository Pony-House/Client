/*
  Always place EnvAPI within any module export. NEVER DO THE OTHER WAY!
*/

import EventEmitter from 'events';
import moment from 'moment-timezone';
import { objType } from '../tools';

// Emitter
class EnvAPI extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
    this.InitializedDB = false;
  }

  async startDB() {
    this.start();
    if (!this.InitializedDB) {
      this.InitializedDB = true;

      if (typeof __ENV_APP__.WEB3 === 'boolean' && __ENV_APP__.WEB3) {
        await this.getDB('WEB3');
      }

      if (typeof __ENV_APP__.IPFS === 'boolean' && __ENV_APP__.IPFS) {
        await this.getDB('IPFS');
      }
    }
  }

  start() {
    if (!this.Initialized) {
      this.Initialized = true;

      this.content = !__ENV_APP__.ELECTRON_MODE
        ? global.localStorage.getItem('ponyHouse-env')
        : '{}';

      try {
        this.content = JSON.parse(this.content) ?? {};
      } catch (err) {
        this.content = {};
      }

      if (typeof __ENV_APP__.WEB3 === 'boolean' && __ENV_APP__.WEB3) {
        this.content.WEB3 = typeof this.content.WEB3 === 'boolean' ? this.content.WEB3 : true;
      } else {
        this.content.WEB3 = false;
      }

      if (typeof __ENV_APP__.IPFS === 'boolean' && __ENV_APP__.IPFS) {
        this.content.IPFS = typeof this.content.IPFS === 'boolean' ? this.content.IPFS : true;
      } else {
        this.content.IPFS = false;
      }
    }
  }

  get(folder) {
    this.start();
    if (typeof folder === 'string' && folder.length > 0) {
      if (typeof this.content[folder] !== 'undefined') return this.content[folder];
      return null;
    }

    return this.content;
  }

  async getDB(folder) {
    if (__ENV_APP__.ELECTRON_MODE) {
      const data = await global.tinyDB.get(`SELECT * FROM envData WHERE id=$id;`, { $id: folder });
      if (objType(data, 'object') && typeof data.value === 'string') {
        this.content[folder] =
          data.value === 'true' ? true : data.value === 'false' ? false : data.value;
        return this.content[folder];
      }
      return null;
    }

    return null;
  }

  set(folder, value) {
    this.start();
    if (typeof folder === 'string' && (typeof value === 'string' || typeof value === 'boolean')) {
      if (folder.length <= 20) {
        this.content[folder] = value;

        if (!__ENV_APP__.ELECTRON_MODE) {
          global.localStorage.setItem('ponyHouse-env', JSON.stringify(this.content));
        } else {
          global.tinyDB.run(
            `INSERT OR REPLACE INTO envData (id, unix, value) VALUES($id, $unix, $value);`,
            {
              $id: folder,
              $unix: moment().unix(),
              $value: String(value),
            },
          );
        }

        this.emit(folder, value);
      } else {
        console.error('ENV value name length is greater than the limit! Limit: 20');
      }
    }
  }
}

// Functions and class
const envAPI = new EnvAPI();
envAPI.setMaxListeners(Infinity);
export default envAPI;

if (__ENV_APP__.MODE === 'development') {
  global.envAPI = envAPI;
}
