import { BrowserWindow } from 'electron';

export default function startEvents(ipcMain, newWin) {

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

};