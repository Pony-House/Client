import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';

import fs from 'node:fs';
import { release } from 'node:os';
import path from 'node:path';

// @ts-ignore
import { objType } from 'for-promise/utils/lib.mjs';

import startNotifications from './notification';
import startEvents from './events';
import startResizeEvents from './events/resize';
import { appDataPrivate, startTempFolders } from './tempFolders';
import { addTray } from './tray';
import getConsoleMessage from './events/getConsoleMessage';
// import tinyDB from './db';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = path.join(__dirname, '../');
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

const openDevTools =
  Array.isArray(process.argv) &&
  typeof process.argv[1] === 'string' &&
  process.argv[1] === '--devtools';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const title = 'Pony House';
const electronCache: {
  isQuiting: boolean;
  appStarted: boolean;
  firstTime: boolean;
  appReady: boolean;
  win: BrowserWindow | null;
} = {
  isQuiting: false,
  appStarted: false,
  firstTime: false,
  appReady: false,
  win: null,
};

// Here, you can also use other preload
const preload = path.join(__dirname, '../preload/index.js');
const tinyUrl = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');
const imgPath = path.join(process.env.VITE_PUBLIC, './img');
const iconPath = path.join(imgPath, './png');
const icon = path.join(iconPath, `./cinny.${process.platform === 'linux' ? 'png' : 'ico'}`);

const appShow = {
  change: (value: boolean) => {
    appShow.enabled = value;
    if (electronCache.win && electronCache.win.webContents)
      electronCache.win.webContents.send('tiny-app-is-show', value);
  },

  enabled: false,
};

const startDevTools = () => {
  if (electronCache.win && electronCache.win.webContents) {
    const consoleMessage = getConsoleMessage();
    electronCache.win.webContents.openDevTools();
    electronCache.win.webContents.send('console-message', consoleMessage[0], consoleMessage[1]);
  }
};

async function createWindow() {
  if (!electronCache.firstTime) {
    // Mark First time
    electronCache.firstTime = true;

    // Load Frame Extension
    // await loadExtension('frame');

    // Get Data
    const initFile = path.join(appDataPrivate, 'init.json');
    let data = null;
    try {
      data = JSON.parse(fs.readFileSync(initFile, 'utf8'));
      if (!objType(data, 'object')) data = {};
    } catch (e) {
      data = {};
    }

    // Bounds
    const bounds =
      data &&
      data.bounds &&
      typeof data.bounds.width === 'number' &&
      typeof data.bounds.height === 'number'
        ? data.bounds
        : { width: 1200, height: 700 };

    // Create Window
    electronCache.win = new BrowserWindow({
      title,
      icon,
      frame: false,
      transparent: true,
      titleBarStyle: 'hidden',
      show: true,
      autoHideMenuBar: true,
      width: bounds.width,
      height: bounds.height,
      minWidth: 700,
      minHeight: 400,
      webPreferences: {
        preload,
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    startTempFolders(electronCache.win, tinyUrl ? '_dev' : '');
    // await tinyDB(path.join(appDataPrivate, `database${tinyUrl ? '_dev' : ''}.db`), ipcMain, electronCache.win);
    if (process.platform === 'win32') {
      electronCache.win.setAppDetails({
        appId: 'pony-house-matrix',
        appIconPath: icon,
        relaunchDisplayName: title,
      });
    }

    electronCache.win.on('focus', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-focused', true);
    });

    electronCache.win.on('blur', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-focused', false);
    });

    electronCache.win.on('show', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-visible', true);
    });

    electronCache.win.on('hide', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-visible', false);
    });

    electronCache.win.on('maximize', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-maximized', true);
    });

    electronCache.win.on('unmaximize', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('window-is-maximized', false);
    });

    electronCache.win.on('will-resize', () => {
      if (electronCache.win && electronCache.win.webContents) {
        electronCache.win.webContents.send('window-is-maximized', electronCache.win.isMaximized());
      }
    });

    electronCache.win.on('resize', () => {
      if (electronCache.win && electronCache.win.webContents) {
        electronCache.win.webContents.send('window-is-maximized', electronCache.win.isMaximized());
      }
    });

    electronCache.win.on('resized', () => {
      if (electronCache.win && electronCache.win.webContents) {
        electronCache.win.webContents.send('window-is-maximized', electronCache.win.isMaximized());
      }
    });

    ipcMain.on('electron-cache-values', () => {
      if (electronCache.win && electronCache.win.webContents)
        electronCache.win.webContents.send('electron-cache-values', {
          isQuiting: electronCache.isQuiting,
          appStarted: electronCache.appStarted,
          firstTime: electronCache.firstTime,
          appReady: electronCache.appReady,
        });
    });

    ipcMain.on('window-is-maximized', () => {
      if (electronCache.win && electronCache.win.webContents) {
        electronCache.win.webContents.send('window-is-maximized', electronCache.win.isMaximized());
      }
    });

    ipcMain.on('window-maximize', () => {
      if (electronCache.win) electronCache.win.maximize();
    });

    ipcMain.on('window-unmaximize', () => {
      if (electronCache.win) electronCache.win.unmaximize();
    });

    ipcMain.on('window-minimize', () => {
      if (electronCache.win) electronCache.win.minimize();
    });

    ipcMain.on('window-close', () => {
      if (electronCache.win) electronCache.win.hide();
    });

    ipcMain.on('change-app-icon', (event, img) => {
      try {
        if (typeof img === 'string' && img.length > 0) {
          if (electronCache.win) electronCache.win.setIcon(path.join(iconPath, `./${img}`));
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Start modules
    startResizeEvents(ipcMain, electronCache);
    startEvents(ipcMain, electronCache, appShow, startDevTools);
    startNotifications(ipcMain, electronCache);

    // Remove Menu
    electronCache.win.removeMenu();

    if (tinyUrl) {
      // electron-vite-vue#298
      electronCache.win.loadURL(tinyUrl);
      // Open devTool if the app is not packaged
      if (!openDevTools) startDevTools();
    } else {
      electronCache.win.loadFile(indexHtml);
    }

    if (openDevTools) startDevTools();

    // Show Page
    electronCache.win.once('ready-to-show', () => {
      // if (electronCache.win) electronCache.win.show();
      electronCache.appStarted = true;
      appShow.change(true);

      // Ping
      if (electronCache.win && electronCache.win.webContents) {
        electronCache.win.webContents.send('ping', {
          exe: app.getPath('exe'),
          DIST_ELECTRON: process.env.DIST_ELECTRON,
          DIST: process.env.DIST,
          VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
          VITE_PUBLIC: process.env.VITE_PUBLIC,
          platform: process.platform,
          preload,
          tinyUrl,
          indexHtml,
          icon,
          title,
        });
      }
    });

    // Make all links open with the browser, not with the application
    electronCache.win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url);
      return { action: 'deny' };
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // Prevent Close
    electronCache.win.on('close', (event) => {
      if (electronCache.win) {
        const winData = { bounds: electronCache.win.getBounds() };
        fs.writeFileSync(initFile, JSON.stringify(winData));
      }

      if (electronCache.appStarted) {
        if (!electronCache.isQuiting) {
          event.preventDefault();
          if (electronCache.win) electronCache.win.hide();
          appShow.change(false);
        }

        return false;
      }
    });
  }
}

// Anti Multi Same App
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (electronCache.win) {
      if (electronCache.win.isMinimized()) {
        electronCache.win.restore();
      }
      electronCache.win?.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => createWindow());
  app.on('ready', () => {
    if (!electronCache.appReady) {
      electronCache.appReady = true;
      // Show app
      const showApp = () => {
        if (electronCache.appStarted) {
          if (electronCache.win) electronCache.win.show();
          appShow.change(true);
        }
      };

      // Create Tray
      const tray = new Tray(icon);
      const contextMenu = Menu.buildFromTemplate(
        // @ts-ignore
        addTray(
          electronCache,
          startDevTools,
          app,
          appShow,
          showApp,
          path.join(imgPath, './android/android-chrome-16x16.png'),
          title,
        ),
      );

      tray.setToolTip(title);
      tray.setTitle(title);
      tray.setContextMenu(contextMenu);

      if (process.platform === 'linux') tray.on('click', showApp);
      else tray.on('double-click', showApp);

      ipcMain.on('change-tray-icon', (event, img) => {
        try {
          if (typeof img === 'string' && img.length > 0) {
            tray.setImage(path.join(iconPath, `./${img}`));
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
}

app.on('window-all-closed', () => {
  electronCache.win = null;
  electronCache.isQuiting = true;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (electronCache.win) {
    // Focus on the main window if the user tried to open another
    if (electronCache.win.isMinimized()) electronCache.win.restore();
    electronCache.win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${tinyUrl}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
