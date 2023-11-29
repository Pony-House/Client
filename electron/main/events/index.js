import { BrowserWindow, powerMonitor } from 'electron';

export default function startEvents(ipcMain, newWin, appShow) {

    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender;
        const tinyWin = BrowserWindow.fromWebContents(webContents);
        if (tinyWin) tinyWin.setTitle(title);
    });

    ipcMain.on('tiny-focus-window', (event) => {
        const webContents = event.sender;
        const tinyWin = BrowserWindow.fromWebContents(webContents);
        if (tinyWin) setTimeout(() => { tinyWin.show(); tinyWin.focus(); }, 200);
    });

    ipcMain.on('systemIdleTime', () => {
        const idleSecs = powerMonitor.getSystemIdleTime();
        newWin.webContents.send('systemIdleTime', idleSecs);
    });

    ipcMain.on('systemIdleState', (event, value) => {
        const idleSecs = powerMonitor.getSystemIdleState(value);
        newWin.webContents.send('systemIdleState', idleSecs);
    });

    ipcMain.on('openDevTools', () => {
        newWin.webContents.openDevTools();
    });

    ipcMain.on('windowIsVisible', (event, isVisible) => {
        newWin[!isVisible ? 'hide' : 'show']();
        appShow.change((isVisible === true));
    });

};