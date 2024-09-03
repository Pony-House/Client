import { ipcRenderer, contextBridge } from 'electron';
import { EventEmitter } from 'events';

class ElectronWindow extends EventEmitter {
  constructor() {
    super();
    this.appShow = true;
    this.maximized = false;
    this._pinged = false;
    this.data = {};
    this.cache = {};
    this.visible = false;
    this.focused = false;
  }

  _firstPing(data) {
    this._pinged = true;
    this.data = data;
  }

  _setCache(value) {
    this.cache = value;
  }

  _setIsVisible(value) {
    this.visible = value;
  }

  _setIsFocused(value) {
    this.focused = value;
  }

  _setShowStatus(value) {
    this.appShow = value;
  }

  _setIsMaximized(value) {
    this.maximized = value;
  }

  getCache() {
    return this.cache;
  }

  getData() {
    return this.data;
  }

  getShowStatus() {
    return this.appShow;
  }

  isFocused() {
    return this.focused;
  }

  isVisible() {
    return this.visible;
  }

  isMaximized() {
    return this.maximized;
  }
}

const electronWindow = new ElectronWindow();
ipcRenderer.on('resize', (event, data) => electronWindow.emit('resize', data));

ipcRenderer.on('set-proxy', (event, data) => {
  electronWindow.emit('setProxy', data);
});

ipcRenderer.on('set-proxy-error', (event, data) => {
  try {
    const err = new Error(data.message);
    err.code = data.code;
    err.message = data.message;
    err.cause = data.cause;
    err.stack = data.stack;
    electronWindow.emit('setProxyError', err);
  } catch (err) {
    console.error(err);
  }
});

contextBridge.exposeInMainWorld('changeTrayIcon', (img) => {
  if (
    img === 'cinny.ico' ||
    img === 'cinny-unread-red.ico' ||
    img === 'cinny.png' ||
    img === 'cinny-unread-red.png'
  ) {
    ipcRenderer.send('change-tray-icon', img);
  }
});

contextBridge.exposeInMainWorld('changeAppIcon', (img) => {
  if (
    img === 'cinny.ico' ||
    img === 'cinny-unread-red.ico' ||
    img === 'cinny.png' ||
    img === 'cinny-unread-red.png'
  ) {
    ipcRenderer.send('change-app-icon', img);
  }
});

// App Status
ipcRenderer.on('tiny-app-is-show', (event, data) => {
  electronWindow._setShowStatus(data);
  electronWindow.emit('appShow', data);
});

ipcRenderer.on('window-is-maximized', (_event, arg) => {
  electronWindow._setIsMaximized(arg);
  electronWindow.emit('isMaximized', arg);
});

ipcRenderer.on('window-is-focused', (_event, arg) => {
  electronWindow._setIsFocused(arg);
  electronWindow.emit('isFocused', arg);
});

ipcRenderer.on('window-is-visible', (_event, arg) => {
  electronWindow._setIsVisible(arg);
  electronWindow.emit('isVisible', arg);
});

ipcRenderer.on('ping', (_event, arg) => electronWindow._firstPing(arg));
ipcRenderer.on('electron-cache-values', (event, msg) => electronWindow._setCache(msg));

contextBridge.exposeInMainWorld('electronWindow', {
  on: (event, callback) => electronWindow.on(event, callback),
  off: (event, callback) => electronWindow.on(event, callback),
  once: (event, callback) => electronWindow.once(event, callback),

  setIsVisible: (isVisible) => ipcRenderer.send('windowIsVisible', isVisible),

  getShowStatus: () => electronWindow.getShowStatus(),
  getData: () => electronWindow.getData(),

  isVisible: () => electronWindow.isVisible(),
  isFocused: () => electronWindow.isFocused(),
  isMaximized: () => electronWindow.isMaximized(),

  requestCache: () => ipcRenderer.send('electron-cache-values', true),
  getCache: () => electronWindow.getCache(),

  setProxy: (config) => ipcRenderer.send('set-proxy', config),

  forceFocus: () => ipcRenderer.send('tiny-force-focus-window', true),
  focus: () => ipcRenderer.send('tiny-focus-window', true),
  blur: () => ipcRenderer.send('tiny-blur-window', true),

  show: () => ipcRenderer.send('tiny-show-window', true),
  hide: () => ipcRenderer.send('window-hide', true),

  maximize: () => ipcRenderer.send('window-maximize', true),
  unmaximize: () => ipcRenderer.send('window-unmaximize', true),
  minimize: () => ipcRenderer.send('window-minimize', true),
  quit: () => ipcRenderer.send('app-quit', true),

  getExecPath: () => process.execPath,
});
export { electronWindow };
