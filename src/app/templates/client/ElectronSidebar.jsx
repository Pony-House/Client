import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import favIconManager from '@src/util/libs/favicon';
import Img from '@src/app/atoms/image/Image';

let head;
function ElectronSidebar({ isDevToolsOpen = false }) {
  const [isMaximize, setIsMaximize] = useState(false);
  const windowRef = useRef(null);

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
          `.root-electron-style, .root-electron-style-solo, .pswp.pswp--open .pswp__bg { height: ${String(newSize)}px !important; }`,
        );
    };
    const maxWindow = () => {
      if (electronWindowStatus.isMaximized()) {
        electronWindowStatus.unmaximize();
        setIsMaximize(false);
      } else {
        electronWindowStatus.maximize();
        setIsMaximize(true);
      }
    };

    useEffect(() => {
      const el = $(windowRef.current);
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
      el.on('dblclick', maxWindow);
      return () => {
        favIconManager.off('valueChange', favIconUpdated);
        $(window).off('resize', resizePage);
        el.off('dblclick', maxWindow);
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
      <div
        ref={windowRef}
        id="electron-titlebar"
        className={`d-flex${isDevToolsOpen ? ' devtools-open' : ''}`}
      >
        <div className="title w-100">
          {typeof urlBase === 'string' && typeof icon === 'string' ? (
            <Img className="icon" src={`${urlBase}${icon}`} alt="icon" />
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
          <button className="maximize button" onClick={maxWindow}>
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

ElectronSidebar.propTypes = {
  isDevToolsOpen: PropTypes.bool,
};

export default ElectronSidebar;
