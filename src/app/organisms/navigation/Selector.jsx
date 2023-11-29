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
import { getAppearance, getAnimatedImageUrl } from '../../../util/libs/appearance';
import { getDataList } from '../../../util/selectedRoom';

// Selector Function
function Selector({
  roomId, isDM, drawerPostie, onClick, roomObject, isProfile, notSpace,
}) {

  // Base Script
  const mx = initMatrix.matrixClient;
  const noti = initMatrix.notifications;
  const appearanceSettings = getAppearance();

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

  // Get User room
  let user;
  let roomName = room.name;
  if (isDM) {

    const usersCount = room.getJoinedMemberCount();
    if (usersCount === 2) {

      const members = room.getMembersWithMembership('join');
      const member = members.find(m => m.userId !== mx.getUserId());
      if (member) {

        user = mx.getUser(member.userId);
        const fNickname = getDataList('user_cache', 'friend_nickname', user.userId);

        if (typeof fNickname !== 'string' || fNickname.length === 0) {

          if (typeof user.displayName === 'string' && user.displayName.length > 0) {
            roomName = user.displayName;
          }

          else if (typeof user.userId === 'string' && user.userId.length > 0) {
            roomName = user.userId;
          }

        } else {
          roomName = fNickname;
        }

      }

    }

  }

  // Image
  let imageSrc = user && user.avatarUrl ? mx.mxcUrlToHttp(user.avatarUrl, 24, 24, 'crop') : room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;
  if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;

  let imageAnimSrc = user && user.avatarUrl ?
    !appearanceSettings.enableAnimParams ? mx.mxcUrlToHttp(user.avatarUrl) : getAnimatedImageUrl(mx.mxcUrlToHttp(user.avatarUrl, 24, 24, 'crop'))
    :
    !appearanceSettings.enableAnimParams ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl) : getAnimatedImageUrl(room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 24, 24, 'crop'))
      || null;
  if (imageAnimSrc === null) imageAnimSrc = !appearanceSettings.enableAnimParams ? room.getAvatarUrl(mx.baseUrl) : getAnimatedImageUrl(room.getAvatarUrl(mx.baseUrl, 24, 24, 'crop')) || null;

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
      notSpace={notSpace}
      key={roomId}
      isProfile={isProfile}
      name={roomName}
      roomId={roomId}
      animParentsCount={3}
      user={user}
      room={room}
      imageAnimSrc={isDM || notSpace ? imageAnimSrc : null}
      imageSrc={isDM || notSpace ? imageSrc : null}
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
          tooltipPlacement="left"
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
  notSpace: false,
};

Selector.propTypes = {

  notSpace: PropTypes.bool,
  isProfile: PropTypes.bool,
  roomId: PropTypes.string.isRequired,
  isDM: PropTypes.bool,

  roomObject: PropTypes.object,

  drawerPostie: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,

};

export default Selector;
