import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';
import { release } from 'node:os';
import path from 'node:path';
import { update } from './update';

import startNotifications from './notification';
import startEvents from './events';
import startResizeEvents from './events/resize';

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

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const title = 'Pony House';
let appShow: boolean;
let isQuiting: boolean;
let appStarted: boolean;
let firstTime = false;
let appReady = false;

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = path.join(__dirname, '../preload/index.js');
const tinyUrl = process.env.VITE_DEV_SERVER_URL;
const indexHtml = path.join(process.env.DIST, 'index.html');
const icon = path.join(process.env.VITE_PUBLIC, './favicon.ico');

async function createWindow() {
  if (!firstTime) {
    firstTime = true;

    win = new BrowserWindow({
      title,
      icon,
      show: false,
      webPreferences: {
        preload,
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    startResizeEvents(ipcMain, win);
    startEvents(ipcMain, win);
    startNotifications(ipcMain, win);

    win.removeMenu();

    if (tinyUrl) {
      // electron-vite-vue#298
      win.loadURL(tinyUrl);
      // Open devTool if the app is not packaged
      win.webContents.openDevTools();
    } else {
      win.loadFile(indexHtml);
    }

    // Show Page
    win.once('ready-to-show', () => {
      if (win) win.show();
      appStarted = true;
      appShow = true;

      // Ping
      if (win) {
        win.webContents.send('ping', {
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
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:')) shell.openExternal(url);
      return { action: 'deny' };
    });

    // Apply electron-updater
    update(win);

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow('activate');
    });

    // Prevent Close
    win.on('close', (event) => {
      if (!isQuiting) {
        event.preventDefault();
        if (win) win.hide();
        appShow = false;
      }

      return false;
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
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win?.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => createWindow('ready'));
  app.on('ready', () => {
    if (!appReady) {
      appReady = true;
      // Create Tray
      const tray = new Tray(icon);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show App',
          click: () => {
            if (appStarted) {
              if (win) win.show();
              appShow = true;
            }
          },
        },
        {
          label: 'Quit',
          click: () => {
            isQuiting = true;
            app.quit();
          },
        },
      ]);

      tray.setToolTip(title);
      tray.setTitle(title);
      tray.setContextMenu(contextMenu);

      tray.on('double-click', () => {
        if (appStarted) {
          if (!appShow) {
            if (win) win.show();
            appShow = true;
          } else {
            if (win) win.hide();
            appShow = false;
          }
        }
      });
    }
  });
}

app.on('window-all-closed', () => {
  win = null;
  isQuiting = true;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow('activate-2');
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
