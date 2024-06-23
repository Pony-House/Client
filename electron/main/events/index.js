import { BrowserWindow, powerMonitor } from 'electron';

export default function startEvents(ipcMain, electronCache, appShow, startDevTools) {
  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender;
    const tinyWin = BrowserWindow.fromWebContents(webContents);
    if (tinyWin) tinyWin.setTitle(title);
  });

  ipcMain.on('tiny-focus-window', (event) => {
    const webContents = event.sender;
    const tinyWin = BrowserWindow.fromWebContents(webContents);
    if (tinyWin)
      setTimeout(() => {
        tinyWin.show();
        tinyWin.focus();
      }, 200);
  });

  ipcMain.on('systemIdleTime', () => {
    const idleSecs = powerMonitor.getSystemIdleTime();
    if (electronCache.win) electronCache.win.webContents.send('systemIdleTime', idleSecs);
  });

  ipcMain.on('systemIdleState', (event, value) => {
    const idleSecs = powerMonitor.getSystemIdleState(value);
    if (electronCache.win) electronCache.win.webContents.send('systemIdleState', idleSecs);
  });

  ipcMain.on('openDevTools', () => {
    startDevTools();
  });

  ipcMain.on('windowIsVisible', (event, isVisible) => {
    if (electronCache.win) electronCache.win[!isVisible ? 'hide' : 'show']();
    appShow.change(isVisible === true);
  });
}
