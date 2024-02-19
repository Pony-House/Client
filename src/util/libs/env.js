import EventEmitter from 'events';

/*
  This file for some reason does not find localStorage in the electronjs version. 
  So for this reason, the settings to enable and disable IPFS and Web3 via the login page are disabled in the destkop version.
  If you know how to resolve this, feel free to submit a pull request.
*/

// Emitter
class EnvAPI extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
  }

  start() {
    if (!this.Initialized && global.localStorage) {
      this.Initialized = true;

      this.content = global.localStorage.getItem('ponyHouse-env');

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

    // Glitch detected. Temp mode
    else {
      this.content = {};

      if (typeof __ENV_APP__.WEB3 === 'boolean' && __ENV_APP__.WEB3) {
        this.content.WEB3 = true;
      } else {
        this.content.WEB3 = false;
      }

      if (typeof __ENV_APP__.IPFS === 'boolean' && __ENV_APP__.IPFS) {
        this.content.IPFS = true;
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

  set(folder, value) {
    this.start();
    if (typeof folder === 'string') {
      this.content[folder] = value;
      global.localStorage.setItem('ponyHouse-env', JSON.stringify(this.content));
      this.emit(folder, value);
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
