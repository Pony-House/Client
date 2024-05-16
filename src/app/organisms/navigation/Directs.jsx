import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import Postie from '../../../util/Postie';
import { roomIdByActivity } from '../../../util/sort';

import RoomsCategory from './RoomsCategory';

const drawerPostie = new Postie();
function Directs({ size }) {
  const mx = initMatrix.matrixClient;
  const { roomList, notifications } = initMatrix;
  const [directIds, setDirectIds] = useState([]);

  useEffect(() => {
    setDirectIds([...roomList.directs].sort(roomIdByActivity));
  }, [size]);

  useEffect(() => {
    const handleTimeline = (event, room, toStartOfTimeline, removed, data) => {
      if (!roomList.directs.has(room.roomId)) return;
      if (!data.liveEvent) return;
      if (directIds[0] === room.roomId) return;
      const newDirectIds = [room.roomId];
      directIds.forEach((id) => {
        if (id === room.roomId) return;
        newDirectIds.push(id);
      });
      setDirectIds(newDirectIds);
    };
    mx.on('Room.timeline', handleTimeline);
    return () => {
      mx.removeListener('Room.timeline', handleTimeline);
    };
  }, [directIds]);

  useEffect(() => {
    const selectorChanged = (
      selectedRoomId,
      prevSelectedRoomId,
      eventId,
      selectedThreadId,
      prevThreadId,
    ) => {
      if (!drawerPostie.hasTopic('selector-change')) return;
      const addresses = [];
      if (drawerPostie.hasSubscriber('selector-change', selectedRoomId, selectedThreadId))
        addresses.push([selectedRoomId, selectedThreadId]);
      if (drawerPostie.hasSubscriber('selector-change', prevSelectedRoomId, prevThreadId))
        addresses.push([prevSelectedRoomId, prevThreadId]);
      if (addresses.length === 0) return;
      drawerPostie.post('selector-change', addresses, selectedRoomId, selectedThreadId);
    };

    const notiChanged = (roomId, threadId, total, prevTotal) => {
      if (total === prevTotal) return;
      if (drawerPostie.hasTopicAndSubscriber('unread-change', roomId, threadId)) {
        drawerPostie.post('unread-change', roomId, threadId);
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

  return (
    <>
      <div className="px-3 pe-2 pb-2 pt-4 text-truncate noselect">
        <span className="no-category-button text-gray very-small text-uppercase text-truncate ms-2">
          Rooms
        </span>
      </div>

      <RoomsCategory
        name="People"
        hideHeader
        roomIds={directIds}
        drawerPostie={drawerPostie}
        type="directs"
        isDM
      />
    </>
  );
}
Directs.propTypes = {
  size: PropTypes.number.isRequired,
};

export default Directs;
