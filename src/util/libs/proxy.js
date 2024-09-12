import EventEmitter from 'events';
import storageManager from './Localstorage';

/* 
  direct - In direct mode all connections are created directly, without any proxy involved.
  fixed_servers - In fixed_servers mode the proxy configuration is specified in proxyRules. This is the default mode if proxyRules is specified.
  system - In system mode the proxy configuration is taken from the operating system. Note that the system mode is different from setting no proxy configuration. In the latter case, Electron falls back to the system settings only if no command-line options influence the proxy configuration.    
*/

// Emitter
class MatrixProxy extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
  }

  // Get Proxy
  getProxyConfig() {
    // Elecron Mode
    if (__ENV_APP__.ELECTRON_MODE && global.electronWindow) {
      const proxySettings = {};
      if (this.content.enabled) {
        if (this.content.mode === 'system') proxySettings.mode = 'system';
        else if (
          this.content.mode === 'fixed_servers' &&
          typeof this.content.protocol === 'string' &&
          typeof this.content.address === 'string' &&
          typeof this.content.port === 'number' &&
          this.content.port > -1
        ) {
          proxySettings.mode = 'fixed_servers';
          proxySettings.proxyRules = `${this.content.protocol}://${this.content.address}:${String(this.content.port)}`;
        } else proxySettings.mode = 'direct';
      } else proxySettings.mode = 'direct';
      return proxySettings;
    }
    // Nothing
    else return null;
  }

  // Start Proxy
  startProxy() {
    const tinyThis = this;
    this._start();
    return new Promise((resolve) => {
      // Elecron Mode
      if (__ENV_APP__.ELECTRON_MODE && global.electronWindow) {
        global.electronWindow.once('setProxy', (data) => {
          resolve();
          tinyThis.emit('setProxy', { type: 'electron', data });
          global.electronWindow.on('setProxy', (data2) => {
            tinyThis.emit('setProxy', { type: 'electron', data: data2 });
          });
        });
        global.electronWindow.setProxy(tinyThis.getProxyConfig());
      }

      // Normal
      else resolve();
    });
  }

  // Start settings
  _start() {
    if (!this.Initialized) {
      this.Initialized = true;

      // Get Content
      this.content = storageManager.getJson('ponyHouse-proxy', 'obj');

      // Prepare settings
      this.content.enabled =
        typeof this.content.enabled === 'boolean' ? this.content.enabled : false;
      this.content.mode = typeof this.content.mode === 'string' ? this.content.mode : 'system';

      this.content.protocol =
        typeof this.content.protocol === 'string' ? this.content.protocol : 'socks5';

      this.content.address =
        typeof this.content.address === 'string' ? this.content.address : '127.0.0.1';

      this.content.port = typeof this.content.port === 'number' ? this.content.port : 9050;
    }
  }

  // Config
  get(folder) {
    if (typeof folder === 'string' && folder.length > 0) {
      if (typeof this.content[folder] !== 'undefined') return this.content[folder];
      return null;
    }
    return this.content;
  }

  set(folder, value) {
    if (typeof folder === 'string') {
      this.content[folder] = value;
      storageManager.setJson('ponyHouse-proxy', this.content);
      this.emit(folder, value);
    }
  }
}

// Functions and class
const matrixProxy = new MatrixProxy();
export function getProxyStorage(folder) {
  return matrixProxy.get(folder);
}

export function setProxyStorage(folder, value) {
  return matrixProxy.set(folder, value);
}

export const toggleProxyAction = (dataFolder, setToggle) => (data) => {
  setProxyStorage(dataFolder, data);
  setToggle(data === true);
};

matrixProxy.setMaxListeners(__ENV_APP__.MAX_LISTENERS);
export default matrixProxy;

if (__ENV_APP__.MODE === 'development') {
  global.proxyApi = {
    getCfg: getProxyStorage,
    setCfg: setProxyStorage,
  };
}
