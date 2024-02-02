import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import objectHash from 'object-hash';

import tinyAPI from '../../../util/mods';
import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import ScrollView from '../../atoms/scroll/ScrollView';

import DrawerHeader from './DrawerHeader';
import DrawerBreadcrumb from './DrawerBreadcrumb';
import Home from './Home';
import Directs from './Directs';

import IconButton from '../../atoms/button/IconButton';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useSelectedTab } from '../../hooks/useSelectedTab';
import { useSelectedSpace } from '../../hooks/useSelectedSpace';
import { getSelectRoom, getSelectSpace } from '../../../util/selectedRoom';
import { getCurrentState } from '../../../util/matrixUtil';
import { selectRoomMode } from '../../../client/action/navigation';
import { setLoadingPage } from '../../templates/client/Loading';
import { objType } from '../../../util/tools';

// System State
function useSystemState() {
  // Data
  const [systemState, setSystemState] = useState({ status: null, value: null });
  const [oldSystemState, setOldSystemState] = useState({ status: null, value: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // State Check
    const handleSystemState = (state) => {
      if (!isRefreshing) {
        if (state === 'ERROR' || state === 'RECONNECTING' || state === 'STOPPED') {
          const tinyStatus = { status: 'Connection lost!', value: state };
          tinyAPI.emit('systemState', tinyStatus);
          setSystemState(tinyStatus);
        }

        if (systemState !== null && systemState.status !== null) {
          const tinyStatus = { status: null, value: state };
          tinyAPI.emit('systemState', tinyStatus);
          setSystemState(tinyStatus);
        }
      }
    };

    // Detect recover from reconnect
    if (
      oldSystemState.value === 'ERROR' ||
      oldSystemState.value === 'RECONNECTING' ||
      oldSystemState.value === 'STOPPED'
    ) {
      if (
        __ENV_APP__.ELECTRON_MODE &&
        objType(global.useLoadingElectron, 'object') &&
        typeof global.useLoadingElectron.appendLoading === 'function'
      ) {
        global.useLoadingElectron.appendLoading();
      } else {
        $('body').empty();
        setLoadingPage('Refreshing...');
      }

      setIsRefreshing(true);

      window.location.reload();
    }

    // Insert new old
    if (objectHash(systemState) !== objectHash(oldSystemState)) setOldSystemState(systemState);

    // Sync
    initMatrix.matrixClient.on('sync', handleSystemState);
    return () => {
      initMatrix.matrixClient.removeListener('sync', handleSystemState);
    };
  }, [systemState]);

  // Complete
  return [systemState];
}

// Drawer
function Drawer() {
  const [systemState] = useSystemState();
  const [selectedTab] = useSelectedTab();
  const [spaceId] = useSelectedSpace();
  const [, forceUpdate] = useForceUpdate();
  const scrollRef = useRef(null);

  const homeClickRef = useRef(null);

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
    bannerCfg = getCurrentState(room).getStateEvents('pony.house.settings', 'banner')?.getContent();
  }

  let avatarSrc = '';
  if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
    avatarSrc = mx.mxcUrlToHttp(bannerCfg.url, 960, 540);
  } else {
    $('.space-drawer-body').removeClass('drawer-with-banner');
    $('#space-header > .navbar').removeClass('banner-mode').css('background-image', '');
  }

  return (
    <>
      <div className={`space-drawer-body${avatarSrc ? ' drawer-with-banner' : ''}`}>
        <DrawerHeader selectedTab={selectedTab} spaceId={spaceId} banner={avatarSrc} room={room} />

        <ScrollView ref={scrollRef} autoHide>
          {navigation.selectedSpacePath.length > 1 && selectedTab !== cons.tabs.DIRECTS && (
            <DrawerBreadcrumb spaceId={spaceId} />
          )}

          {!spaceId ? (
            <center className="small text-start d-grid w-100">
              <IconButton
                ref={homeClickRef}
                fa="fa-solid fa-house"
                id="space-drawer-home-button"
                className={`text-start mt-3 mx-3 space-drawer-menu-item${!getSelectRoom() && !getSelectSpace() ? ' active' : ''}`}
                onClick={() => {
                  global.resetRoomInfo();
                  selectRoomMode('room');
                  $(homeClickRef.current).addClass('active');
                }}
              >
                <span className="ms-3">Home</span>
              </IconButton>
            </center>
          ) : null}

          {selectedTab !== cons.tabs.DIRECTS ? (
            <Home spaceId={spaceId} />
          ) : (
            <Directs size={roomList.directs.size} />
          )}
        </ScrollView>
      </div>

      {systemState !== null && systemState.status !== null ? (
        <Modal dialogClassName="modal-dialog-centered modal-dialog-scrollable" show>
          <Modal.Header className="noselect">
            <Modal.Title className="h5">System Status</Modal.Title>
          </Modal.Header>
          <Modal.Body className="small">{systemState.status}</Modal.Body>
        </Modal>
      ) : null}
    </>
  );
}

export default Drawer;
