import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

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
function Home({ spaceId }) {
  const mx = initMatrix.matrixClient;
  const { roomList, notifications, accountData } = initMatrix;
  const { spaces, rooms, directs } = roomList;
  useCategorizedSpaces();
  const isCategorized = accountData.categorizedSpaces.has(spaceId);

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
    const selectorChanged = (selectedRoomId, prevSelectedRoomId) => {
      if (!drawerPostie.hasTopic('selector-change')) return;
      const addresses = [];
      if (drawerPostie.hasSubscriber('selector-change', selectedRoomId))
        addresses.push(selectedRoomId);
      if (drawerPostie.hasSubscriber('selector-change', prevSelectedRoomId))
        addresses.push(prevSelectedRoomId);
      if (addresses.length === 0) return;
      drawerPostie.post('selector-change', addresses, selectedRoomId);
    };

    const notiChanged = (roomId, total, prevTotal) => {
      if (total === prevTotal) return;
      if (drawerPostie.hasTopicAndSubscriber('unread-change', roomId)) {
        drawerPostie.post('unread-change', roomId);
      }
    };

    navigation.on(cons.events.navigation.ROOM_SELECTED, selectorChanged);
    notifications.on(cons.events.notifications.NOTI_CHANGED, notiChanged);
    notifications.on(cons.events.notifications.MUTE_TOGGLED, notiChanged);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, selectorChanged);
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, notiChanged);
      notifications.removeListener(cons.events.notifications.MUTE_TOGGLED, notiChanged);
    };
  }, []);

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
          roomIds={spaceIds.sort(roomIdByAtoZ)}
          drawerPostie={drawerPostie}
        />
      )}

      {(roomIds.length !== 0 && (
        <RoomsCategory
          notSpace={roomSettings.notSpace}
          type="home"
          name="Rooms"
          roomIds={roomIds.sort(roomIdByAtoZ)}
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
          roomIds={directIds.sort(roomIdByActivity)}
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
Home.defaultProps = {
  spaceId: null,
};
Home.propTypes = {
  spaceId: PropTypes.string,
};

export default Home;
