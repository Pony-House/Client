import React, { useState, useEffect, useRef } from 'react';

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
import Alert from './Alert';
import DragDrop from './DragDrop';
import { resizeWindowChecker } from '../../../util/tools';
import { startUserAfk, stopUserAfk } from '../../../util/userStatusEffects';

function Client() {
  const [isLoading, changeLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Heating up');

  const navWrapperRef = useRef(null);

  function onRoomModeSelected(roomType) {

    navWrapperRef.current?.classList.remove('room-mode');
    navWrapperRef.current?.classList.remove('navigation-mode');

    if (roomType === 'room') navWrapperRef.current?.classList.add('room-mode');
    if (roomType === 'navigation') navWrapperRef.current?.classList.add('navigation-mode');
    resizeWindowChecker();

  }

  useEffect(() => {
    startUserAfk();
    navigation.on(cons.events.navigation.SELECTED_ROOM_MODE, onRoomModeSelected);
    window.addEventListener('resize', resizeWindowChecker, true);
    return (() => {
      stopUserAfk();
      window.removeEventListener('resize', resizeWindowChecker, true);
      navigation.removeListener(cons.events.navigation.SELECTED_ROOM_MODE, onRoomModeSelected);
    });
  }, []);

  useEffect(() => {
    let counter = 0;
    const iId = setInterval(() => {
      const msgList = [
        'Almost there...',
        'Looks like you have a lot of stuff to heat up!',
      ];
      if (counter === msgList.length - 1) {
        setLoadingMsg(msgList[msgList.length - 1]);
        clearInterval(iId);
        return;
      }
      setLoadingMsg(msgList[counter]);
      counter += 1;
    }, 15000);
    initMatrix.once('init_loading_finished', () => {
      clearInterval(iId);
      initHotkeys();
      initRoomListListener(initMatrix.roomList);
      changeLoading(false);
    });
    initMatrix.init();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-display">
        <div className="loading__menu">
          <ContextMenu
            placement="bottom"
            content={(
              <>
                <MenuItem onClick={() => initMatrix.clearCacheAndReload()}>
                  Clear cache & reload
                </MenuItem>
                <MenuItem onClick={() => initMatrix.logout()}>Logout</MenuItem>
              </>
            )}
            render={(toggle) => <IconButton size="extra-small" onClick={toggle} fa="bi bi-three-dots-vertical" />}
          />
        </div>
        <Spinner />
        <Text className="loading__message" variant="b2">{loadingMsg}</Text>

        <div className="loading__appname">
          <Text variant="h2" weight="medium">Pony House</Text>
        </div>
      </div>
    );
  }

  resizeWindowChecker();
  return (
    <DragDrop navWrapperRef={navWrapperRef} >
      <div className="navigation-wrapper">
        <Navigation />
      </div>
      <div className='room-wrapper'>
        <Room />
      </div>
      <Windows />
      <Dialogs />
      <EmojiBoardOpener />
      <ReusableContextMenu />
      <Alert />
    </DragDrop>
  );
}

export default Client;
