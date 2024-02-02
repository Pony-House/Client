import React, { useEffect, useState } from 'react';
import { openInviteList } from '../../../../client/action/navigation';

import Avatar from '../../../atoms/avatar/Avatar';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';
import cons from '../../../../client/state/cons';

import initMatrix from '../../../../client/initMatrix';
import { notificationClasses } from './Notification';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';

import * as roomActions from '../../../../client/action/room';
import { objType } from '../../../../util/tools';
import { addToDataFolder, getDataList } from '../../../../util/selectedRoom';

export function getPrivacyRefuseRoom(member, newRoom, isInverse = false, totalInvites = null) {
  const mx = initMatrix.matrixClient;
  const content = mx.getAccountData('pony.house.privacy')?.getContent() ?? {};
  let whitelisted = false;

  if (content?.roomAutoRefuse === true) {
    const room =
      objType(member, 'object') && typeof member.roomId === 'string'
        ? mx.getRoom(member.roomId)
        : newRoom || null;
    if (room) {
      const serverWhitelist = getDataList('server_cache', 'whitelist_invite', room.roomId);
      if (serverWhitelist) {
        whitelisted = true;
      } else {
        const inviterId =
          room.getDMInviter === 'function'
            ? room.getDMInviter()
            : typeof room.getCreator === 'function'
              ? room.getCreator()
              : null;
        if (typeof inviterId === 'string') {
          const isWhitelist = getDataList('user_cache', 'whitelist', inviterId);

          if (isWhitelist) {
            whitelisted = true;
          }
        }
      }
    }
  }

  if (
    (!isInverse && (typeof totalInvites !== 'number' || totalInvites !== 0)) ||
    ((!objType(member, 'object') || typeof member.roomId !== 'string') && !newRoom)
  ) {
    return content?.roomAutoRefuse === true && !whitelisted;
  }

  return false;
}

export function setPrivacyRefuseRoom(roomId, value) {
  addToDataFolder('server_cache', 'whitelist_invite', roomId, value);
}

// Total Invites
function useTotalInvites() {
  // Rooms
  const { roomList } = initMatrix;
  const totalInviteCount = () =>
    roomList.inviteRooms.size + roomList.inviteSpaces.size + roomList.inviteDirects.size;
  const [totalInvites, updateTotalInvites] = useState(totalInviteCount());

  // Effect
  useEffect(() => {
    // Change
    const onInviteListChange = () => {
      updateTotalInvites(totalInviteCount());
    };

    // Events
    roomList.on(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    return () => {
      roomList.removeListener(cons.events.roomList.INVITELIST_UPDATED, onInviteListChange);
    };
  }, []);

  // Complete
  return [totalInvites];
}

// Notification Update
export default function InviteSidebar() {
  const [lastMemberRoomId, setLastMemberRoomId] = useState(null);

  const mx = initMatrix.matrixClient;
  useEffect(() => {
    const roomJoinValidator = (event, member) => {
      if (member.membership === 'invite' && member.userId === mx.getUserId()) {
        // mx.joinRoom(member.roomId);

        if (getPrivacyRefuseRoom(member)) {
          roomActions.leave(member.roomId);
        }

        setLastMemberRoomId(member.roomId);
      }
    };

    mx.on('RoomMember.membership', roomJoinValidator);
    return () => {
      mx.removeListener('RoomMember.membership', roomJoinValidator);
    };
  });

  const [totalInvites] = useTotalInvites();

  return (
    !getPrivacyRefuseRoom({ roomId: lastMemberRoomId }, null, true, totalInvites) &&
    totalInvites !== 0 && (
      <SidebarAvatar
        tooltip="Invites"
        onClick={() => openInviteList()}
        avatar={<Avatar faSrc="bi bi-envelope-plus-fill" size="normal" />}
        notificationBadge={
          <NotificationBadge className={notificationClasses} alert content={totalInvites} />
        }
      />
    )
  );
}
