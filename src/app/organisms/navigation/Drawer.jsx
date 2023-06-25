import React, { useState, useEffect, useRef } from 'react';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import Text from '../../atoms/text/Text';
import ScrollView from '../../atoms/scroll/ScrollView';

import DrawerHeader from './DrawerHeader';
import DrawerBreadcrumb from './DrawerBreadcrumb';
import Home from './Home';
import Directs from './Directs';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useSelectedTab } from '../../hooks/useSelectedTab';
import { useSelectedSpace } from '../../hooks/useSelectedSpace';

function useSystemState() {
  const [systemState, setSystemState] = useState(null);

  useEffect(() => {
    const handleSystemState = (state) => {
      if (state === 'ERROR' || state === 'RECONNECTING' || state === 'STOPPED') {
        setSystemState({ status: 'Connection lost!' });
      }
      if (systemState !== null) setSystemState(null);
    };
    initMatrix.matrixClient.on('sync', handleSystemState);
    return () => {
      initMatrix.matrixClient.removeListener('sync', handleSystemState);
    };
  }, [systemState]);

  return [systemState];
}

function Drawer() {
  const [systemState] = useSystemState();
  const [selectedTab] = useSelectedTab();
  const [spaceId] = useSelectedSpace();
  const [, forceUpdate] = useForceUpdate();
  const scrollRef = useRef(null);
  const { roomList } = initMatrix;

  useEffect(() => {
    const handleUpdate = () => {
      forceUpdate();
    };
    roomList.on(cons.events.roomList.ROOMLIST_UPDATED, handleUpdate);
    return () => {
      roomList.removeListener(cons.events.roomList.ROOMLIST_UPDATED, handleUpdate);
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    });
  }, [selectedTab]);

  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(spaceId);

  let bannerCfg;
  if (room) {
    bannerCfg = room.currentState.getStateEvents('pony.house.settings', 'banner')?.getContent();
  }

  let avatarSrc = '';
  if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
    avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 960, 540);
  } else {

    const spaceHeaderBody = document.querySelector('.space-drawer-body');
    const spaceHeader = document.querySelector('#space-header > .navbar');

    if (spaceHeaderBody) spaceHeaderBody.classList.remove('drawer-with-banner');

    if (spaceHeader) {
      spaceHeader.classList.remove('banner-mode');
      spaceHeader.style.backgroundImage = '';
    }

  }

  return (
    <div className={`space-drawer-body${avatarSrc ? ' drawer-with-banner' : ''}`}>

      <DrawerHeader selectedTab={selectedTab} spaceId={spaceId} banner={avatarSrc} room={room} />

      <ScrollView ref={scrollRef} autoHide>

        {navigation.selectedSpacePath.length > 1 && selectedTab !== cons.tabs.DIRECTS && (
          <DrawerBreadcrumb spaceId={spaceId} />
        )}

        {
          selectedTab !== cons.tabs.DIRECTS
            ? <Home spaceId={spaceId} />
            : <Directs size={roomList.directs.size} />
        }
      </ScrollView>

      {systemState !== null && (
        <div className="drawer__state">
          <Text>{systemState.status}</Text>
        </div>
      )}

    </div>
  );
}

export default Drawer;
