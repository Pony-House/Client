import React, { useState, useEffect } from 'react';

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
global.resetRoomInfo = () => typeof resetRoomInfo === 'function' ? resetRoomInfo() : null;
let tinyRoomInfo;

export function getRoomInfo() {
  return tinyRoomInfo;
};

function Room() {

  const defaultRoomInfo = {
    roomTimeline: null,
    eventId: null,
    forceScroll: null,
  };

  const [roomInfo, setRoomInfo] = useState(defaultRoomInfo);
  tinyAPI.emit('setRoomInfo', defaultRoomInfo);

  const [isDrawer, setIsDrawer] = useState(settings.isPeopleDrawer);

  const sendRoomInfo = (newData) => {
    if (roomInfo.roomTimeline) roomInfo.roomTimeline?.destroyProvider();
    setRoomInfo(newData);
    tinyRoomInfo = newData;
    tinyAPI.emit('setRoomInfo', newData);
  };

  const mx = initMatrix.matrixClient;
  resetRoomInfo = () => {

    $('#space-header .space-drawer-body .room-selector--selected').removeClass('room-selector--selected');
    selectRoomMode('navigation');

    sendRoomInfo({
      roomTimeline: null,
      eventId: null,
      forceScroll: null,
    });

  };

  useEffect(() => {
    const handleRoomSelected = (rId, pRoomId, eId, forceScroll) => {

      roomInfo.roomTimeline?.removeInternalListeners();
      $('.space-drawer-menu-item').removeClass('active');

      if (mx.getRoom(rId)) {
        sendRoomInfo({
          roomTimeline: new RoomTimeline(rId),
          eventId: eId ?? null,
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
  }, [roomInfo]);

  useEffect(() => {
    const handleDrawerToggling = (visiblity) => setIsDrawer(visiblity);
    settings.on(cons.events.settings.PEOPLE_DRAWER_TOGGLED, handleDrawerToggling);
    return () => {
      settings.removeListener(cons.events.settings.PEOPLE_DRAWER_TOGGLED, handleDrawerToggling);
    };
  }, []);

  const { roomTimeline, eventId } = roomInfo;
  if (roomTimeline === null) {
    setTimeout(() => openNavigation());
    return <Welcome />;
  }

  return (
    <div className="room">
      <div className="room__content">
        <RoomSettings roomId={roomTimeline.roomId} />
        <RoomView roomTimeline={roomTimeline} eventId={eventId} />
      </div>
      {isDrawer && <PeopleDrawer roomId={roomTimeline.roomId} />}
    </div>
  );
}

export default Room;
