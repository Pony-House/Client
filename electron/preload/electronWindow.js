import { ipcRenderer, contextBridge } from 'electron';
import { EventEmitter } from 'events';

class ElectronWindow extends EventEmitter {
  constructor() {
    super();
    this.appShow = true;
    this.isMaximized = false;
    this._pinged = false;
    this.data = {};
  }

  _firstPing(data) {
    this._pinged = true;
    this.data = data;
  }

  getData() {
    return this.data;
  }

  getShowStatus() {
    return this.appShow;
  }

  setShowStatus(value) {
    this.appShow = value;
  }

  setIsMaximized(value) {
    this.isMaximized = value;
  }

  getIsMaximized() {
    return this.isMaximized;
  }
}

const electronWindow = new ElectronWindow();
ipcRenderer.on('resize', (event, data) => electronWindow.emit('resize', data));

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
  if (typeof data === 'boolean') {
    electronWindow.setShowStatus(data);
    electronWindow.emit('appShow', data);
  }
});

ipcRenderer.on('window-is-maximized', (_event, arg) => {
  if (typeof arg === 'boolean') {
    electronWindow.setIsMaximized(arg);
    electronWindow.emit('windowIsMaximized', arg);
  }
});

ipcRenderer.on('window-is-focused', (_event, arg) => {
  if (typeof arg === 'boolean') electronWindow.emit('windowIsFocused', arg);
});

ipcRenderer.on('ping', (_event, arg) => {
  console.log('[electron] [ping] ', arg);
  electronWindow._firstPing(arg);
});

contextBridge.exposeInMainWorld('electronWindow', {
  on: (event, callback) => electronWindow.on(event, callback),
  off: (event, callback) => electronWindow.on(event, callback),
  once: (event, callback) => electronWindow.once(event, callback),

  setIsVisible: (isVisible) => ipcRenderer.send('windowIsVisible', isVisible),

  getShowStatus: () => electronWindow.getShowStatus(),
  getIsMaximized: () => electronWindow.getIsMaximized(),
  getData: () => electronWindow.getData(),

  focus: () => ipcRenderer.send('tiny-focus-window', true),

  maximize: () => ipcRenderer.send('window-maximize', true),
  unmaximize: () => ipcRenderer.send('window-unmaximize', true),
  minimize: () => ipcRenderer.send('window-minimize', true),
  close: () => ipcRenderer.send('window-close', true),

  getExecPath: () => process.execPath,
});

export { electronWindow };
