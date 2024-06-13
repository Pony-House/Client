import React, { useState, useEffect, useRef } from 'react';
import appLoadMsg from '@mods/appLoadMsg';

import settings from '@src/client/state/settings';
import matrixAppearance from '@src/util/libs/appearance';
import { initHotkeys } from '../../../client/event/hotkeys';
import { initRoomListListener } from '../../../client/event/roomList';

import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';
import Navigation from '../../organisms/navigation/Navigation';
import ContextMenu, { MenuItem } from '../../atoms/context-menu/ContextMenu';
import IconButton from '../../atoms/button/IconButton';
import ReusableContextMenu from '../../atoms/context-menu/ReusableContextMenu';
import Room from '../../organisms/room/Room';
import Windows from '../../organisms/pw/Windows';
import Dialogs from '../../organisms/pw/Dialogs';
import EmojiBoardOpener from '../../organisms/emoji-board/EmojiBoardOpener';

import initMatrix from '../../../client/initMatrix';
import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';
import DragDrop from './DragDrop';
import {
  btModal,
  dice,
  resizeWindowChecker,
  scrollFixer,
  tinyAppZoomValidator,
} from '../../../util/tools';
import { startUserAfk, stopUserAfk } from '../../../util/userStatusEffects';
import Mods from './Mods';
import LoadingPage from './Loading';
import urlParams from '../../../util/libs/urlParams';
import {
  selectRoom,
  selectRoomMode,
  selectSpace,
  selectTab,
} from '../../../client/action/navigation';
import ElectronSidebar from './ElectronSidebar';

let versionChecked = false;

if (__ENV_APP__.ELECTRON_MODE) {
  window.setElectronResize(() => resizeWindowChecker());
}

function Client() {
  const [startWorked, setStartWorked] = useState(true);
  const [errorMessage, setErrorMessage] = useState('Unknown');
  const [isLoading, changeLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(
    appLoadMsg.en.items[dice(appLoadMsg.en.items.length) - 1],
  );
  const [navigationSidebarHidden, setNavigationSidebarHidden] = useState(
    settings.getIsNavigationSidebarHidden(),
  );

  const [isHoverSidebar, setIsHoverSidebar] = useState(matrixAppearance.get('hoverSidebar'));
  const [sidebarTransition, setSidebarTransition] = useState(
    matrixAppearance.get('sidebarTransition'),
  );

  const navWrapperRef = useRef(null);

  function onRoomModeSelected(roomType) {
    const navWrapper = $(navWrapperRef.current);
    navWrapper.removeClass('room-mode').removeClass('navigation-mode');

    if (roomType === 'room') navWrapper.addClass('room-mode');
    if (roomType === 'navigation') navWrapper.addClass('navigation-mode');
    resizeWindowChecker();
  }

  // Prepare params data
  const tab = urlParams.get('tab');
  const spaceId = urlParams.get('space_id');
  const isSpace = urlParams.get('is_space');

  const roomType = urlParams.get('room_mode');

  const roomId = urlParams.get('room_id');
  const eventId = urlParams.get('event_id');
  const threadId = urlParams.get('thread_id');

  useEffect(() => {
    startUserAfk();
    navigation.on(cons.events.navigation.SELECTED_ROOM_MODE, onRoomModeSelected);
    const keypressDetector = (event) => {
      const e = event.originalEvent;

      const body = $('body');

      if (e.shiftKey) {
        body.addClass('shiftKey');
      } else {
        body.removeClass('shiftKey');
      }

      if (e.ctrlKey) {
        body.addClass('ctrlKey');
      } else {
        body.removeClass('ctrlKey');
      }
    };

    $(window)
      .on('resize', resizeWindowChecker)
      .on('mousewheel', scrollFixer)
      .on('keypress keyup keydown', keypressDetector);

    return () => {
      stopUserAfk();
      $(window)
        .off('resize', resizeWindowChecker)
        .on('mousewheel', scrollFixer)
        .off('keypress keyup keydown', keypressDetector);
      navigation.removeListener(cons.events.navigation.SELECTED_ROOM_MODE, onRoomModeSelected);
    };
  }, []);

  useEffect(() => {
    let counter = -1;
    let counter2 = -1;

    const iId = setInterval(() => {
      if (counter2 !== 2) {
        counter2 += 1;
        setLoadingMsg(appLoadMsg.en.items[dice(appLoadMsg.en.items.length) - 1]);
      } else {
        counter += 1;

        if (counter === 3) {
          setLoadingMsg(appLoadMsg.en.loading[appLoadMsg.en.loading.length - 1]);
          clearInterval(iId);
          return;
        }

        setLoadingMsg(appLoadMsg.en.loading[counter]);
      }
    }, 15000);

    initMatrix.once('init_loading_finished', () => {
      clearInterval(iId);
      initHotkeys();
      initRoomListListener(initMatrix.roomList);
      changeLoading(false);

      // Load Params
      if (typeof tab === 'string' && tab.length > 0) selectTab(tab, isSpace);
      if (typeof spaceId === 'string' && spaceId.length > 0) selectSpace(spaceId);
      if ((typeof roomType === 'string' && roomType === 'room') || roomType === 'navigation')
        selectRoomMode(roomType);

      setTimeout(() => {
        if (typeof roomId === 'string' && roomId.length > 0) {
          if (typeof roomType !== 'string') selectRoomMode('room');
          selectRoom(
            roomId,
            typeof eventId === 'string' && eventId.length > 0 ? eventId : null,
            typeof threadId === 'string' && threadId.length > 0 ? threadId : null,
          );
        }
      }, 100);
    });

    initMatrix
      .init()
      .then((tinyResult) => {
        if (tinyResult.err && typeof tinyResult.err.message === 'string')
          setErrorMessage(tinyResult.err.message);
        setStartWorked(tinyResult.userId !== null);
      })
      .catch((err) => {
        console.error(err);
        if (typeof err.message === 'string') setErrorMessage(err.message);
        setStartWorked(null);
      });
  }, []);

  useEffect(() => {
    const handleDrawerToggling = (visiblity) => setNavigationSidebarHidden(visiblity);
    settings.on(cons.events.settings.NAVIGATION_SIDEBAR_HIDDEN_TOGGLED, handleDrawerToggling);
    const handleHoverSidebar = (visiblity) => setIsHoverSidebar(visiblity);
    const handleHoverSidebarEffect = (visiblity) => setSidebarTransition(visiblity);
    matrixAppearance.on('sidebarTransition', handleHoverSidebarEffect);
    matrixAppearance.on('hoverSidebar', handleHoverSidebar);
    return () => {
      matrixAppearance.off('sidebarTransition', handleHoverSidebarEffect);
      matrixAppearance.off('hoverSidebar', handleHoverSidebar);
      settings.removeListener(
        cons.events.settings.NAVIGATION_SIDEBAR_HIDDEN_TOGGLED,
        handleDrawerToggling,
      );
    };
  }, []);

  if (startWorked) {
    if (isLoading) {
      return (
        <>
          <ElectronSidebar />
          <div
            className={`loading-display${__ENV_APP__.ELECTRON_MODE ? ' root-electron-style' : ''}`}
          >
            <div className="loading__menu">
              <ContextMenu
                placement="bottom"
                content={
                  <>
                    <MenuItem onClick={() => initMatrix.clearCacheAndReload()}>
                      Clear cache & reload
                    </MenuItem>
                    <MenuItem onClick={() => initMatrix.logout()}>Logout</MenuItem>
                  </>
                }
                render={(toggle) => (
                  <IconButton size="extra-small" onClick={toggle} fa="bi bi-three-dots-vertical" />
                )}
              />
            </div>
            <Spinner />
            <div className="very-small fw-bold text-uppercase mt-3">Did you know</div>
            <p className="loading__message small">{loadingMsg}</p>

            <div className="loading__appname">
              <Text variant="h2" weight="medium">
                {__ENV_APP__.INFO.name}
              </Text>
            </div>
          </div>
        </>
      );
    }

    if (__ENV_APP__.ELECTRON_MODE && !versionChecked && global.checkVersions) {
      versionChecked = true;
      global
        .checkVersions()
        .then((versionData) => {
          if (
            versionData &&
            typeof versionData.value.name === 'string' &&
            versionData.result === 1
          ) {
            const tinyUrl = `https://github.com/Pony-House/Client/releases/tag/${versionData.value.name}`;
            const tinyModal = btModal({
              id: 'tiny-update-warn',
              title: `New version available!`,

              dialog: 'modal-dialog-centered modal-lg',
              body: [
                $('<p>', { class: 'small' }).text(
                  `Version ${versionData.value.name} of the app is now available for download! Click the button below to be sent to the update page.`,
                ),
                $('<center>').append(
                  $('<a>', { href: tinyUrl, class: 'btn btn-primary text-bg-force' })
                    .on('click', () => {
                      global.open(tinyUrl, '_target');
                      tinyModal.hide();
                      return false;
                    })
                    .text('Open download page'),
                ),
              ],
            });
          }
        })
        .catch((err) => {
          console.error(err);
          alert(err.message, 'Check Versions Error');
        });
    }

    $('body').css(
      'zoom',
      `${tinyAppZoomValidator(Number(global.localStorage.getItem('pony-house-zoom')))}%`,
    );
    const tinyMod = <Mods />;

    resizeWindowChecker();
    const classesDragDrop = ['navigation-tiny-base'];
    if (sidebarTransition) classesDragDrop.push('use-transition-sidebar');
    if (isHoverSidebar) classesDragDrop.push('use-hover-sidebar');

    if (!navigationSidebarHidden) {
      $('body').addClass('navigation-wrapper-auto-visible');
    } else {
      $('body').removeClass('navigation-wrapper-auto-visible');
    }

    return (
      <>
        <ElectronSidebar />
        <LoadingPage />
        {tinyMod}
        <DragDrop
          className={`${classesDragDrop.join(' ')}${navigationSidebarHidden ? ' disable-navigation-wrapper' : ''}`}
          navWrapperRef={navWrapperRef}
        >
          <div
            className="navigation-wrapper"
            onMouseEnter={
              isHoverSidebar
                ? () => {
                    if (isHoverSidebar) $('body').addClass('navigation-wrapper-hover');
                  }
                : null
            }
            onMouseLeave={
              isHoverSidebar
                ? () => {
                    if (isHoverSidebar) $('body').removeClass('navigation-wrapper-hover');
                  }
                : null
            }
          >
            <Navigation />
          </div>
          <div className="room-wrapper">
            <Room />
          </div>
          <Windows />
          <Dialogs />
          <EmojiBoardOpener />
          <ReusableContextMenu />
        </DragDrop>
      </>
    );
  } else {
    return (
      <>
        <ElectronSidebar />
        <div
          className={`loading-display${__ENV_APP__.ELECTRON_MODE ? ' root-electron-style' : ''}`}
        >
          <div className="loading__menu">
            <ContextMenu
              placement="bottom"
              content={
                <>
                  <MenuItem onClick={() => initMatrix.clearCacheAndReload()}>
                    Clear cache & reload
                  </MenuItem>
                  <MenuItem onClick={() => initMatrix.logout()}>Logout</MenuItem>
                </>
              }
              render={(toggle) => (
                <IconButton size="extra-small" onClick={toggle} fa="bi bi-three-dots-vertical" />
              )}
            />
          </div>
          <p className="loading__message h2 text-danger">
            <i class="fa-solid fa-triangle-exclamation" />
          </p>
          <div className="small fw-bold text-uppercase mt-3 text-danger">CLIENT ERROR</div>
          <div className="very-small fw-bold text-uppercase mt-3">{errorMessage}</div>

          <div className="loading__appname">
            <Text variant="h2" weight="medium">
              {__ENV_APP__.INFO.name}
            </Text>
          </div>
        </div>
      </>
    );
  }
}

export default Client;
