import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords, abbreviateNumber } from '../../../util/common';
import { joinRuleToIconSrc } from '../../../util/matrixUtil';
import { updateName } from '../../../util/roomName';

import IconButton from '../../atoms/button/IconButton';
import RoomSelector from '../../molecules/room-selector/RoomSelector';
import RoomOptions from '../../molecules/room-options/RoomOptions';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';

import { useForceUpdate } from '../../hooks/useForceUpdate';

// Selector Function
function Selector({
  roomId, isDM, drawerPostie, onClick, roomObject, isProfile
}) {

  // Base Script
  const mx = initMatrix.matrixClient;
  const noti = initMatrix.notifications;

  // Room Data
  let room;

  if (!roomObject) {
    room = mx.getRoom(roomId);
  } else {
    room = roomObject;
  }

  // Is Room
  if (!isDM && !room.nameCinny) {
    updateName(room);
  }

  // Image
  let imageSrc = room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;
  if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;

  // Is Muted
  const isMuted = noti.getNotiType(roomId) === cons.notifs.MUTE;

  // Force Update
  const [, forceUpdate] = useForceUpdate();

  // Effects
  useEffect(() => {
    const unSub1 = drawerPostie.subscribe('selector-change', roomId, forceUpdate);
    const unSub2 = drawerPostie.subscribe('unread-change', roomId, forceUpdate);
    return () => {
      unSub1();
      unSub2();
    };
  }, []);

  // Options
  const openOptions = (e) => {

    // Get Cords
    const cords = getEventCords(e, '.room-selector');

    // Mobile Screen - Viewport
    if (window.matchMedia('screen and (max-width: 768px)').matches) {
      cords.x -= 290;
    }

    e.preventDefault();
    openReusableContextMenu(
      'right',
      cords,
      room.isSpaceRoom()
        ? (closeMenu) => <SpaceOptions roomId={roomId} afterOptionSelect={closeMenu} />
        : (closeMenu) => <RoomOptions roomId={roomId} afterOptionSelect={closeMenu} />,
    );

  };

  // Complete Data
  return (
    <RoomSelector
      key={roomId}
      isProfile={isProfile}
      name={room.name}
      roomId={roomId}
      imageSrc={isDM ? imageSrc : null}
      iconSrc={isDM ? null : joinRuleToIconSrc(room.getJoinRule(), room.isSpaceRoom())}
      isSelected={navigation.selectedRoomId === roomId}
      isMuted={isMuted}
      isUnread={!isMuted && noti.hasNoti(roomId)}
      notificationCount={abbreviateNumber(noti.getTotalNoti(roomId))}
      isAlert={noti.getHighlightNoti(roomId) !== 0}
      onClick={onClick}
      onContextMenu={openOptions}
      options={(
        <IconButton
          size="extra-small"
          tooltip="Options"
          tooltipPlacement="right"
          fa="bi bi-three-dots-vertical"
          onClick={openOptions}
        />
      )}
    />
  );

}

// Default
Selector.defaultProps = {
  isDM: true,
  isProfile: false,
};

Selector.propTypes = {

  isProfile: PropTypes.bool,
  roomId: PropTypes.string.isRequired,
  isDM: PropTypes.bool,

  // eslint-disable-next-line react/forbid-prop-types
  roomObject: PropTypes.object,

  drawerPostie: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,

};

export default Selector;
