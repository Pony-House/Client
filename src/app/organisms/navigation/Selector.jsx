import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { objType } from 'for-promise/utils/lib.mjs';

import threadsList from '@src/util/libs/thread';

import muteUserManager from '@src/util/libs/muteUserManager';
import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords, abbreviateNumber } from '../../../util/common';
import { joinRuleToIconSrc } from '../../../util/matrixUtil';
import { updateName } from '../../../util/roomName';

import IconButton from '../../atoms/button/IconButton';
import RoomSelector, { ThreadSelector } from '../../molecules/room-selector/RoomSelector';
import RoomOptions from '../../molecules/room-options/RoomOptions';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { getAppearance, getAnimatedImageUrl } from '../../../util/libs/appearance';
import { getDataList } from '../../../util/selectedRoom';

// Selector Function
function Selector({ roomId, isDM, drawerPostie, onClick, roomObject, isProfile, notSpace }) {
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
  let allowCustomUsername = false;
  let user;
  let roomName = room.name;
  if (isDM) {
    const usersCount = room.getJoinedMemberCount();
    if (usersCount === 2) {
      const members = room.getMembersWithMembership('join');
      const member = members.find((m) => m.userId !== mx.getUserId());
      if (member) {
        user = mx.getUser(member.userId);
        roomName = muteUserManager.getSelectorName(user);
        allowCustomUsername = true;
      }
    }
  }

  // Image
  let imageSrc =
    user && user.avatarUrl
      ? mx.mxcUrlToHttp(user.avatarUrl, 32, 32, 'crop')
      : room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 32, 32, 'crop') || null;
  if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, 32, 32, 'crop') || null;

  let imageAnimSrc =
    user && user.avatarUrl
      ? !appearanceSettings.enableAnimParams
        ? mx.mxcUrlToHttp(user.avatarUrl)
        : getAnimatedImageUrl(mx.mxcUrlToHttp(user.avatarUrl, 32, 32, 'crop'))
      : !appearanceSettings.enableAnimParams
        ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl)
        : getAnimatedImageUrl(
            room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 32, 32, 'crop'),
          ) || null;
  if (imageAnimSrc === null)
    imageAnimSrc = !appearanceSettings.enableAnimParams
      ? room.getAvatarUrl(mx.baseUrl)
      : getAnimatedImageUrl(room.getAvatarUrl(mx.baseUrl, 32, 32, 'crop')) || null;

  // Is Muted
  const isMuted = noti.getNotiType(roomId) === cons.notifs.MUTE;

  // Force Update
  const [, forceUpdate] = useForceUpdate();
  const [lastThreads, setLastThreads] = useState(threadsList.getActives());

  // Effects
  useEffect(() => {
    const threadsListUpdate = () => setLastThreads(threadsList.getActives());
    const unSub1 = drawerPostie.subscribe('selector-change', roomId, forceUpdate);
    const unSub2 = drawerPostie.subscribe('unread-change', roomId, forceUpdate);
    threadsList.on('updatedActiveThreads', threadsListUpdate);
    return () => {
      unSub1();
      unSub2();
      threadsList.off('updatedActiveThreads', threadsListUpdate);
    };
  }, []);

  // Options
  if (!room) {
    console.warn(`Selector: Room ${roomId} not found`);
    return null;
  }

  const openOptions = (e, threadId) => {
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
        : (closeMenu) => (
            <RoomOptions threadId={threadId} roomId={roomId} afterOptionSelect={closeMenu} />
          ),
    );
  };

  const getThreads = room.getThreads();
  const openThreads = getThreads.filter(
    (thread) =>
      thread.id === navigation.selectedThreadId ||
      (objType(lastThreads, 'object') &&
        Array.isArray(lastThreads.actives) &&
        lastThreads.actives.find(
          (ac1) =>
            Array.isArray(ac1) &&
            ac1.find(
              (ac2) =>
                objType(ac2, 'object') &&
                typeof ac2.id === 'string' &&
                ac2.id.replace(`${roomId}:`, '') === thread.id,
            ),
        )),
  );

  return (
    <>
      <RoomSelector
        allowCustomUsername={allowCustomUsername}
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
        isSelected={navigation.selectedRoomId === roomId && navigation.selectedThreadId === null}
        isMuted={isMuted}
        isUnread={!isMuted && noti.hasNoti(roomId)}
        notificationCount={abbreviateNumber(noti.getTotalNoti(roomId))}
        isAlert={noti.getHighlightNoti(roomId) !== 0}
        onClick={onClick}
        onContextMenu={(evt) => openOptions(evt)}
        options={
          <IconButton
            size="extra-small"
            tooltip="Options"
            tooltipPlacement="left"
            fa="bi bi-three-dots-vertical"
            onClick={(evt) => openOptions(evt)}
          />
        }
      />
      {openThreads.map((thread) => (
        <ThreadSelector
          key={thread.id}
          room={room}
          thread={thread}
          isMuted={isMuted}
          isSelected={navigation.selectedThreadId === thread.id}
          onContextMenu={(evt) => openOptions(evt, thread.id)}
          options={
            <IconButton
              size="extra-small"
              tooltip="Options"
              tooltipPlacement="left"
              fa="bi bi-three-dots-vertical"
              onClick={(evt) => openOptions(evt, thread.id)}
            />
          }
        />
      ))}
    </>
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
