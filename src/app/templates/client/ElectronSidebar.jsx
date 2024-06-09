import favIconManager from '@src/util/libs/favicon';
import React, { useEffect, useState } from 'react';

let head;
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
    const resizeRoot = () => {
      let rootSize;
      if (!head) head = document.head || document.getElementsByTagName('head')[0];
      if (head) {
        // Exist DOM
        rootSize = head.querySelector('style#root_electron_css');

        // Create One
        if (!rootSize) {
          rootSize = document.createElement('style');
          rootSize.id = 'root_electron_css';
          head.appendChild(rootSize);
        }
      }

      if (electronWindowStatus.isMaximized()) {
        $('body').addClass('electron-maximized');
      } else {
        $('body').removeClass('electron-maximized');
      }

      const newSize = $(window).height() - 29;
      if (rootSize)
        $(rootSize).html(
          `.root-electron-style, .pswp.pswp--open .pswp__bg { height: ${String(newSize)}px !important; }`,
        );
    };

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
        resizeRoot();
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

    resizeRoot();
    setTimeout(() => resizeRoot(), 10);
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
