export default function startResizeEvents(ipcMain, newWin) {
  // Resize
  const resizeWindowEvent = function () {
    newWin.webContents.send('resize', newWin.getSize());
  };

  newWin.on('resize', resizeWindowEvent);
  newWin.on('resized', resizeWindowEvent);
  newWin.on('will-resize', resizeWindowEvent);

  newWin.on('maximize', resizeWindowEvent);
  newWin.on('unmaximize', resizeWindowEvent);

  newWin.on('minimize', resizeWindowEvent);
  newWin.on('restore', resizeWindowEvent);

  newWin.on('enter-full-screen', resizeWindowEvent);
  newWin.on('leave-full-screen', resizeWindowEvent);

  newWin.on('enter-html-full-screen', resizeWindowEvent);
  newWin.on('leave-html-full-screen', resizeWindowEvent);
}
