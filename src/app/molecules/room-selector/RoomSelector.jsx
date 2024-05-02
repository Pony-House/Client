import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { objType } from 'for-promise/utils/lib.mjs';

import cons from '@src/client/state/cons';
import { abbreviateNumber } from '@src/util/common';
import muteUserManager from '@src/util/libs/muteUserManager';

import { twemojifyReact } from '../../../util/twemojify';
import { colorMXID } from '../../../util/colorMXID';

import Text from '../../atoms/text/Text';
import Avatar from '../../atoms/avatar/Avatar';
import NotificationBadge from '../../atoms/badge/NotificationBadge';
import { blurOnBubbling } from '../../atoms/button/script';
import { getPresence, getUserStatus, updateUserStatusIcon } from '../../../util/onlineStatus';
import initMatrix from '../../../client/initMatrix';
import insertCustomStatus from '../people-selector/insertCustomStatus';
import { checkerFavIcon } from '../../../util/libs/favicon';
import { getAppearance, getAnimatedImageUrl } from '../../../util/libs/appearance';
import { selectRoom, selectRoomMode } from '../../../client/action/navigation';

function RoomSelectorWrapper({
  isSelected,
  isMuted = false,
  isUnread,
  onClick,
  content,
  options = null,
  onContextMenu = null,
  className,
}) {
  const classes = ['room-selector'];
  if (isMuted) classes.push('room-selector--muted');
  if (isUnread) classes.push('room-selector--unread');
  if (isSelected) classes.push('room-selector--selected');

  return (
    <div className={classes.join(' ')}>
      <button
        className={`room-selector__content emoji-size-fix d-block${className ? ` ${className}` : ''}`}
        type="button"
        onClick={onClick}
        onMouseUp={(e) => blurOnBubbling(e, '.room-selector__content')}
        onContextMenu={onContextMenu}
      >
        {content}
      </button>
      <div className="room-selector__options">{options}</div>
    </div>
  );
}
RoomSelectorWrapper.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool,
  isUnread: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  content: PropTypes.node.isRequired,
  options: PropTypes.node,
  onContextMenu: PropTypes.func,
};

function RoomSelector({
  name,
  parentName = null,
  roomId,
  room,
  imageSrc = null,
  imageAnimSrc = null,
  animParentsCount = 4,
  iconSrc = null,
  isSelected = false,
  isMuted = false,
  isUnread,
  notificationCount,
  isAlert,
  options = null,
  onClick,
  onContextMenu = null,
  isProfile = false,
  notSpace = false,
  user,
  allowCustomUsername = false,
}) {
  const [userData, setPresenceStatus] = useState(null);
  const [imgAnimSrc, setImgAnimSrc] = useState(imageAnimSrc);
  const [imgSrc, setImgSrc] = useState(imageSrc);
  const [roomName, setName] = useState(name);

  const statusRef = useRef(null);
  const customStatusRef = useRef(null);

  const mx = initMatrix.matrixClient;

  if (user && !userData) {
    const content = getPresence(user);
    setPresenceStatus(content);
    setTimeout(() => insertCustomStatus(customStatusRef, content), 10);
  }

  const existStatus =
    objType(userData, 'object') &&
    objType(userData.presenceStatusMsg, 'object') &&
    userData.presence !== 'offline' &&
    userData.presence !== 'unavailable' &&
    ((userData.presenceStatusMsg.msg === 'string' && userData.presenceStatusMsg.msg.length > 0) ||
      (typeof userData.presenceStatusMsg.msgIcon === 'string' &&
        userData.presenceStatusMsg.msgIcon.length > 0));

  useEffect(() => {
    if (user) {
      // Status
      const status = $(statusRef.current);

      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyUser) => {
        // Presence
        const appearanceSettings = getAppearance();
        const content = updateUserStatusIcon(status, tinyUser);

        // Image
        let newImageSrc =
          tinyUser && tinyUser.avatarUrl
            ? mx.mxcUrlToHttp(tinyUser.avatarUrl, 32, 32, 'crop')
            : (room && room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 32, 32, 'crop')) ||
              null;
        if (room && newImageSrc === null)
          newImageSrc = room.getAvatarUrl(mx.baseUrl, 32, 32, 'crop') || null;
        setImgSrc(newImageSrc);

        let newImageAnimSrc =
          tinyUser && tinyUser.avatarUrl
            ? mx.mxcUrlToHttp(tinyUser.avatarUrl)
            : (room && !appearanceSettings.enableAnimParams
                ? room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl)
                : getAnimatedImageUrl(
                    room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 32, 32, 'crop'),
                  )) || null;

        if (room && newImageAnimSrc === null)
          newImageAnimSrc = !appearanceSettings.enableAnimParams
            ? room.getAvatarUrl(mx.baseUrl)
            : getAnimatedImageUrl(room.getAvatarUrl(mx.baseUrl, 32, 32, 'crop')) || null;
        setImgAnimSrc(newImageAnimSrc);

        // Room Name
        let newRoomName = room.name;

        if (typeof tinyUser.displayName === 'string' && tinyUser.displayName.length > 0) {
          newRoomName = tinyUser.displayName;
        } else if (typeof tinyUser.userId === 'string' && tinyUser.userId.length > 0) {
          newRoomName = tinyUser.userId;
        }

        if (!allowCustomUsername) setName(newRoomName);
        insertCustomStatus(customStatusRef, content);

        setPresenceStatus(content);
      };

      user.on('User.avatarUrl', updateProfileStatus);
      user.on('User.currentlyActive', updateProfileStatus);
      user.on('User.lastPresenceTs', updateProfileStatus);
      user.on('User.presence', updateProfileStatus);

      return () => {
        user.removeListener('User.currentlyActive', updateProfileStatus);
        user.removeListener('User.lastPresenceTs', updateProfileStatus);
        user.removeListener('User.presence', updateProfileStatus);
        user.removeListener('User.avatarUrl', updateProfileStatus);
      };
    }
  });

  checkerFavIcon();
  const isDefault = !iconSrc || notSpace;

  useEffect(() => {
    const tinyUpdate = (info) => {
      if (user && info.userId === user.userId && allowCustomUsername) setName(info.value);
    };
    muteUserManager.on('friendNickname', tinyUpdate);
    return () => {
      muteUserManager.off('friendNickname', tinyUpdate);
    };
  });

  return (
    <RoomSelectorWrapper
      className="text-truncate"
      isSelected={isSelected}
      isMuted={isMuted}
      isUnread={isUnread}
      content={
        <div
          className={`text-truncate content${user ? ' content-dm' : ''}${existStatus ? ' content-with-custom-status' : ''}`}
        >
          <div
            className={`float-start me-2 h-100 avatar avatar-type--${imgSrc || isDefault ? 'img' : 'icon'}`}
          >
            <Avatar
              text={roomName}
              bgColor={colorMXID(roomId)}
              imageSrc={imgSrc}
              animParentsCount={animParentsCount}
              imageAnimSrc={imgAnimSrc}
              iconColor="var(--ic-surface-low)"
              iconSrc={!isProfile ? iconSrc : null}
              faSrc={isProfile ? 'bi bi-person-badge-fill profile-icon-fa' : null}
              size="extra-small"
              isDefaultImage={isDefault}
            />

            {user ? (
              <i
                ref={statusRef}
                className={`user-status user-status-icon ${getUserStatus(user)}`}
              />
            ) : null}
          </div>

          <Text
            className={`text-truncate username-base${isUnread ? ' username-unread' : ''}`}
            variant="b1"
            weight={isUnread ? 'medium' : 'normal'}
          >
            {twemojifyReact(roomName)}
            {parentName && (
              <span className="very-small text-gray">
                {' — '}
                {twemojifyReact(parentName)}
              </span>
            )}
          </Text>

          {user ? (
            <div
              ref={customStatusRef}
              className="very-small text-gray text-truncate emoji-size-fix-2 user-custom-status"
            />
          ) : null}

          {isUnread && (
            <NotificationBadge
              className="float-end"
              alert={isAlert}
              content={notificationCount !== 0 ? notificationCount : null}
            />
          )}
        </div>
      }
      options={options}
      onClick={onClick}
      onContextMenu={onContextMenu}
    />
  );
}

RoomSelector.propTypes = {
  allowCustomUsername: PropTypes.bool,
  animParentsCount: PropTypes.number,
  notSpace: PropTypes.bool,
  isProfile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  parentName: PropTypes.string,
  roomId: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  imageAnimSrc: PropTypes.string,
  iconSrc: PropTypes.string,
  isSelected: PropTypes.bool,
  isMuted: PropTypes.bool,
  isUnread: PropTypes.bool.isRequired,
  notificationCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isAlert: PropTypes.bool.isRequired,
  options: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func,
};

export default RoomSelector;
export function ThreadSelector({ room, thread, isSelected, isMuted, options, onContextMenu }) {
  const { rootEvent } = thread;
  const { notifications } = initMatrix;

  const [notificationCount, setNotiCount] = useState(
    notifications.getTotalNoti(room.roomId, thread.id),
  );

  const [highlightNotificationCount, setHighNotiCount] = useState(
    notifications.getHighlightNoti(room.roomId, thread.id),
  );

  const isUnread = !isMuted && notificationCount > 0;
  const isAlert = highlightNotificationCount > 0;

  const name = rootEvent?.getContent()?.body ?? 'Unknown thread';

  const onClick = () => {
    selectRoomMode('room');
    selectRoom(thread.roomId, undefined, thread.id);
  };

  useEffect(() => {
    const threadUpdate = (tth) => {
      if (tth.id === thread.id) {
        setNotiCount(notifications.getTotalNoti(room.roomId, thread.id));

        setHighNotiCount(notifications.getHighlightNoti(room.roomId, thread.id));
      }
    };

    notifications.on(cons.events.notifications.THREAD_NOTIFICATION, threadUpdate);
    return () => {
      notifications.off(cons.events.notifications.THREAD_NOTIFICATION, threadUpdate);
    };
  });

  return (
    <RoomSelectorWrapper
      isSelected={isSelected}
      isMuted={isMuted}
      isUnread={!isMuted && notificationCount > 0}
      className="text-truncate"
      content={
        <div className="text-truncate content">
          <p
            className={`my-0 ms-1 me-5 small ${isSelected ? 'text-bg-force' : 'text-bg-low-force'} text-truncate username-base${isUnread ? ' username-unread' : ''}`}
          >
            <i className="bi bi-arrow-return-right me-2 thread-selector__icon" />{' '}
            {twemojifyReact(name)}
          </p>
          {isUnread && (
            <NotificationBadge
              className="float-end"
              alert={isAlert}
              content={notificationCount > 0 ? abbreviateNumber(notificationCount) : null}
            />
          )}
        </div>
      }
      options={options}
      onClick={onClick}
      onContextMenu={onContextMenu}
    />
  );
}

ThreadSelector.propTypes = {
  isSelected: PropTypes.bool,
  isMuted: PropTypes.bool,
  options: PropTypes.node,
  onContextMenu: PropTypes.func,
};
