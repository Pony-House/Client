export default function startResizeEvents(ipcMain, electronCache) {
  // Resize
  const resizeWindowEvent = function () {
    if (electronCache.win)
      electronCache.win.webContents.send('resize', electronCache.win.getSize());
  };

  electronCache.win.on('resize', resizeWindowEvent);
  electronCache.win.on('resized', resizeWindowEvent);
  electronCache.win.on('will-resize', resizeWindowEvent);

  electronCache.win.on('maximize', resizeWindowEvent);
  electronCache.win.on('unmaximize', resizeWindowEvent);

  electronCache.win.on('minimize', resizeWindowEvent);
  electronCache.win.on('restore', resizeWindowEvent);

  electronCache.win.on('enter-full-screen', resizeWindowEvent);
  electronCache.win.on('leave-full-screen', resizeWindowEvent);

  electronCache.win.on('enter-html-full-screen', resizeWindowEvent);
  electronCache.win.on('leave-html-full-screen', resizeWindowEvent);
}
