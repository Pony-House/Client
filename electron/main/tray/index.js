export const addTray = (electronCache, startDevTools, app, appShow, showApp, icon, title) => {
  const trayData = [];
  trayData.push({
    label: title,
    enabled: false,
    icon,
  });

  trayData.push({ type: 'separator' });

  trayData.push({
    label: `Open ${title}`,
    click: showApp,
  });

  trayData.push({
    label: `Check for Updates`,
    click: () => {
      if (electronCache.appStarted) {
        showApp();
        if (electronCache.win) electronCache.win.webContents.send('check-version', true);
      }
    },
  });

  trayData.push({
    label: `Refresh Client`,
    click: () => {
      if (electronCache.appStarted) {
        showApp();
        if (electronCache.win) electronCache.win.webContents.send('refresh-client', true);
      }
    },
  });

  if (__ENV_APP__.DEV_TOOLS_TRAY) {
    trayData.push({ type: 'separator' });
    trayData.push({
      label: 'DevTools (Advanced User)',
      click: () => {
        if (electronCache.appStarted) {
          startDevTools();
        }
      },
    });
  }

  trayData.push({ type: 'separator' });
  trayData.push({
    label: `Quit ${title}`,
    click: () => {
      electronCache.isQuiting = true;
      app.quit();
    },
  });

  return trayData;
};
