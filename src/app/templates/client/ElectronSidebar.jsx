import favIconManager from '@src/util/libs/favicon';
import React, { useEffect, useState } from 'react';

function ElectronSidebar() {
  const [isMaximize, setIsMaximize] = useState(false);

  const [icon, setIcon] = useState(favIconManager.getIcon());
  const [urlBase, setUrlBase] = useState(favIconManager.getUrlBase());

  const [title, setTitle] = useState(favIconManager.getTitle());
  const [subTitle, setSubTitle] = useState(favIconManager.getSubTitle());
  // const [directCount, setDirectCount] = useState(favIconManager.getDirectCount());
  // const [notis, setNotis] = useState(favIconManager.getNotis());
  // const [isUnread, setIsUnread] = useState(favIconManager.isUnread());

  if (__ENV_APP__.ELECTRON_MODE) {
    $('body').addClass('electron-mode');

    useEffect(() => {
      const favIconUpdated = (info) => {
        setIcon(info.icon);
        setUrlBase(info.urlBase);
        setTitle(info.title);
        setSubTitle(info.subTitle);
        // setDirectCount(info.directCount);
        // setNotis(info.notis);
        // setIsUnread(info.unread);
      };
      const resizePage = () => {
        setIsMaximize(electronWindowStatus.isMaximized());
      };

      $(window).on('resize', resizePage);
      favIconManager.on('valueChange', favIconUpdated);
      return () => {
        favIconManager.off('valueChange', favIconUpdated);
        $(window).off('resize', resizePage);
      };
    });

    /*
              {isUnread && typeof notis === 'number' ? (
            <span className="badge bg-danger me-2">{`${directCount > 0 ? `${directCount < 99 ? String(directCount) : '99+'}` : '•'}`}</span>
          ) : null}
    */

    return (
      <div id="electron-titlebar" className="d-flex">
        <div className="title w-100">
          {typeof urlBase === 'string' && typeof icon === 'string' ? (
            <img className="icon" src={`${urlBase}${icon}`} alt="icon" />
          ) : null}
          <span className="tbase text-truncate">{title}</span>
          {typeof subTitle === 'string' ? (
            <span className="tsub text-truncate">{` | ${subTitle}`}</span>
          ) : null}
        </div>
        <div className="options text-end">
          <button className="minimize button" onClick={() => electronWindowStatus.minimize()}>
            <i className="bi bi-dash-lg" />
          </button>
          <button
            className="maximize button"
            onClick={() => {
              if (electronWindowStatus.isMaximized()) {
                electronWindowStatus.unmaximize();
                setIsMaximize(false);
              } else {
                electronWindowStatus.maximize();
                setIsMaximize(true);
              }
            }}
          >
            {isMaximize ? <i className="bi bi-window-stack" /> : <i className="bi bi-square" />}
          </button>
          <button className="close button" onClick={() => electronWindowStatus.close()}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>
    );
  }

  $('body').removeClass('electron-mode');
  return null;
}

export default ElectronSidebar;
