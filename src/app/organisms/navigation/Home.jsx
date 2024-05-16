import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import matrixAppearance, { getAppearance } from '@src/util/libs/appearance';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import Postie from '../../../util/Postie';
import { roomIdByActivity, roomIdByAtoZ } from '../../../util/sort';

import RoomsCategory from './RoomsCategory';

import { useCategorizedSpaces } from '../../hooks/useCategorizedSpaces';

import { openSpaceManage } from '../../../client/action/navigation';
import Button from '../../atoms/button/Button';
import { getCurrentState } from '../../../util/matrixUtil';

const drawerPostie = new Postie();
function Home({ spaceId = null }) {
  const mx = initMatrix.matrixClient;
  const { roomList, notifications, accountData, roomsInput } = initMatrix;
  const { spaces, rooms, directs } = roomList;
  useCategorizedSpaces();
  const isCategorized = accountData.categorizedSpaces.has(spaceId);
  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const [orderHomeByActivity, setOrderHomeByActivity] = useState(
    getAppearance('orderHomeByActivity'),
  );

  let categories = null;
  let spaceIds = [];
  let roomIds = [];
  let directIds = [];
  const roomSettings = { notSpace: !spaceId };

  if (spaceId) {
    const spaceChildIds = roomList.getSpaceChildren(spaceId) ?? [];
    spaceIds = spaceChildIds.filter((roomId) => spaces.has(roomId));
    roomIds = spaceChildIds.filter((roomId) => rooms.has(roomId));
    directIds = spaceChildIds.filter((roomId) => directs.has(roomId));
  } else {
    spaceIds = roomList.getOrphanSpaces().filter((id) => !accountData.spaceShortcut.has(id));
    roomIds = roomList.getOrphanRooms();
  }

  if (isCategorized) {
    categories = roomList.getCategorizedSpaces(spaceIds);
    categories.delete(spaceId);
  }

  useEffect(() => {
    // Update the room list to execute the item order list
    const forceUpdateRoomList = () => {
      if (orderHomeByActivity && !spaceId) forceUpdate();
    };

    const selectorChanged = (
      selectedRoomId,
      prevSelectedRoomId,
      eventId,
      selectedthreadId,
      prevThreadId,
    ) => {
      if (!drawerPostie.hasTopic('selector-change')) return;
      const addresses = [];
      if (drawerPostie.hasSubscriber('selector-change', selectedRoomId, selectedthreadId))
        addresses.push([selectedRoomId, selectedthreadId]);
      if (drawerPostie.hasSubscriber('selector-change', prevSelectedRoomId, prevThreadId))
        addresses.push([prevSelectedRoomId, prevThreadId]);
      if (addresses.length === 0) return;
      drawerPostie.post('selector-change', addresses, selectedRoomId, selectedthreadId);
      if (orderHomeByActivity && !spaceId) forceUpdateRoomList();
    };

    const notiChanged = (roomId, threadId, total, prevTotal) => {
      if (total === prevTotal) return;
      if (drawerPostie.hasTopicAndSubscriber('unread-change', roomId, threadId)) {
        drawerPostie.post('unread-change', roomId, threadId);
      }
      if (orderHomeByActivity && !spaceId) forceUpdateRoomList();
    };

    if (roomsInput) roomsInput.on(cons.events.roomsInput.MESSAGE_SENT, forceUpdateRoomList);
    navigation.on(cons.events.navigation.ROOM_SELECTED, selectorChanged);
    notifications.on(cons.events.notifications.NOTI_CHANGED, notiChanged);
    notifications.on(cons.events.notifications.MUTE_TOGGLED, notiChanged);
    return () => {
      if (roomsInput)
        roomsInput.removeListener(cons.events.roomsInput.MESSAGE_SENT, forceUpdateRoomList);
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, selectorChanged);
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, notiChanged);
      notifications.removeListener(cons.events.notifications.MUTE_TOGGLED, notiChanged);
    };
  }, [spaceId, orderHomeByActivity, spaceId]);

  useEffect(() => {
    const forceUpdateRoomList = (value) => {
      setOrderHomeByActivity(value);
    };
    matrixAppearance.on('orderHomeByActivity', forceUpdateRoomList);
    return () => {
      matrixAppearance.off('orderHomeByActivity', forceUpdateRoomList);
    };
  });

  const room = mx.getRoom(spaceId);

  if (room) {
    const roomIconCfg =
      getCurrentState(room).getStateEvents('pony.house.settings', 'roomIcons')?.getContent() ?? {};
    roomSettings.notSpace = roomIconCfg.isActive === true;
  }

  return (
    <>
      {!isCategorized && spaceIds.length !== 0 && (
        <RoomsCategory
          notSpace={roomSettings.notSpace}
          type="home"
          name="Spaces"
          roomIds={spaceIds.sort(!spaceId && orderHomeByActivity ? roomIdByActivity : roomIdByAtoZ)}
          drawerPostie={drawerPostie}
        />
      )}

      {(roomIds.length !== 0 && (
        <RoomsCategory
          notSpace={roomSettings.notSpace}
          type="home"
          name="Rooms"
          roomIds={roomIds.sort(!spaceId && orderHomeByActivity ? roomIdByActivity : roomIdByAtoZ)}
          drawerPostie={drawerPostie}
        />
      )) ||
        (spaceIds.length < 1 && (
          <center className="p-3 small text-warning">
            <div className="mb-3">No rooms were found. Please enable some room.</div>
            {spaceId && (
              <Button
                variant="primary"
                onClick={() => {
                  openSpaceManage(spaceId);
                }}
              >
                Manage rooms
              </Button>
            )}
          </center>
        ))}

      {directIds.length !== 0 && (
        <RoomsCategory
          notSpace={roomSettings.notSpace}
          type="home"
          name="People"
          roomIds={directIds.sort(!spaceId ? roomIdByActivity : roomIdByAtoZ)}
          drawerPostie={drawerPostie}
        />
      )}

      {isCategorized &&
        [...categories.keys()].sort(roomIdByAtoZ).map((catId) => {
          const rms = [];
          const dms = [];
          categories.get(catId).forEach((id) => {
            if (directs.has(id)) dms.push(id);
            else rms.push(id);
          });
          rms.sort(roomIdByAtoZ);
          dms.sort(roomIdByActivity);
          return (
            <RoomsCategory
              type="home"
              notSpace={roomSettings.notSpace}
              key={catId}
              spaceId={catId}
              name={mx.getRoom(catId).name}
              roomIds={rms.concat(dms)}
              drawerPostie={drawerPostie}
            />
          );
        })}
    </>
  );
}

Home.propTypes = {
  spaceId: PropTypes.string,
};

export default Home;
