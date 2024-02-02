import React, { useState, useEffect } from 'react';
import clone from 'clone';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import settings from '../../../client/state/settings';
import RoomTimeline from '../../../client/state/RoomTimeline';
import navigation from '../../../client/state/navigation';
import { openNavigation, selectRoomMode } from '../../../client/action/navigation';

import Welcome from '../welcome/Welcome';
import RoomView from './RoomView';
import RoomSettings from './RoomSettings';
import PeopleDrawer from './PeopleDrawer';
import tinyAPI from '../../../util/mods';

let resetRoomInfo;
global.resetRoomInfo = () => (typeof resetRoomInfo === 'function' ? resetRoomInfo() : null);
let tinyRoomInfo;

export function getRoomInfo() {
  return tinyRoomInfo;
}

function Room() {
  const defaultRoomInfo = {
    roomTimeline: null,
    eventId: null,
    forceScroll: null,
  };

  const [roomInfo, setRoomInfo] = useState(defaultRoomInfo);
  tinyAPI.emit('setRoomInfo', defaultRoomInfo);

  const [isDrawer, setIsDrawer] = useState(settings.isPeopleDrawer);
  const [isUserList, setIsUserList] = useState(true);

  const sendRoomInfo = (newData) => {
    setRoomInfo(newData);
    tinyRoomInfo = newData;
    tinyAPI.emit('setRoomInfo', newData);
  };

  const mx = initMatrix.matrixClient;
  resetRoomInfo = () => {
    $('#space-header .space-drawer-body .room-selector--selected').removeClass(
      'room-selector--selected',
    );
    selectRoomMode('navigation');

    sendRoomInfo({
      roomTimeline: null,
      eventId: null,
      forceScroll: null,
    });
  };

  useEffect(() => {
    const handleRoomSelected = (roomId, prevRoomId, eventId, threadId, forceScroll) => {
      roomInfo.roomTimeline?.removeInternalListeners();
      $('.space-drawer-menu-item').removeClass('active');

      if (mx.getRoom(roomId)) {
        const threadTimeline = threadId ? RoomTimeline.newFromThread(threadId, roomId) : null;
        const roomTimeline = threadTimeline ?? new RoomTimeline(roomId);
        sendRoomInfo({
          roomTimeline,
          eventId: eventId ?? null,
          forceScroll,
        });
      } else {
        // TODO: add ability to join room if roomId is invalid
        sendRoomInfo({
          roomTimeline: null,
          eventId: null,
          forceScroll,
        });

        $('#space-drawer-home-button').addClass('active');
      }
    };

    navigation.on(cons.events.navigation.ROOM_SELECTED, handleRoomSelected);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, handleRoomSelected);
    };
  }, [mx, roomInfo]);

  useEffect(() => {
    const handleDrawerToggling = (visiblity) => setIsDrawer(visiblity);
    settings.on(cons.events.settings.PEOPLE_DRAWER_TOGGLED, handleDrawerToggling);
    return () => {
      settings.removeListener(cons.events.settings.PEOPLE_DRAWER_TOGGLED, handleDrawerToggling);
    };
  }, []);

  // Welcome Page
  const { roomTimeline, eventId } = roomInfo;
  if (roomTimeline === null) {
    setTimeout(() => openNavigation());
    return <Welcome />;
  }

  // Checker is User List
  const cloneIsUserList = clone(isUserList);
  const peopleDrawer = isDrawer && (
    <PeopleDrawer
      isUserList={isUserList}
      setIsUserList={setIsUserList}
      roomId={roomTimeline.roomId}
    />
  );
  if (cloneIsUserList === isUserList) {
    // Complete
    return (
      <div className="room">
        <div className="room__content">
          <RoomSettings roomId={roomTimeline.roomId} />
          <RoomView isUserList={isUserList} roomTimeline={roomTimeline} eventId={eventId} />
        </div>
        {peopleDrawer}
      </div>
    );
  }

  // Nope
  return null;
}

export default Room;
