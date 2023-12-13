import React, { useEffect, useState } from 'react';
import { openInviteList } from '../../../../client/action/navigation';

import Avatar from '../../../atoms/avatar/Avatar';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';
import cons from '../../../../client/state/cons';

import initMatrix from '../../../../client/initMatrix';
import { notificationClasses } from './Notification';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';

import * as roomActions from '../../../../client/action/room';

export function getPrivacyRefuseRoom() {
  const content = initMatrix.matrixClient.getAccountData('pony.house.privacy')?.getContent() ?? {};
  return (content?.roomAutoRefuse === true);
};

// Total Invites
function useTotalInvites() {

  // Rooms
  const { roomList } = initMatrix;
  const totalInviteCount = () => roomList.inviteRooms.size
    + roomList.inviteSpaces.size
    + roomList.inviteDirects.size;
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

};

// Notification Update
export default function InviteSidebar() {

  const mx = initMatrix.matrixClient;
  useEffect(() => {

    const roomJoinValidator = (event, member) => {

      if (member.membership === "invite" && member.userId === mx.getUserId()) {
        // mx.joinRoom(member.roomId);
        if (getPrivacyRefuseRoom()) roomActions.leave(member.roomId);
      }

    };

    mx.on('RoomMember.membership', roomJoinValidator);
    return () => {
      mx.removeListener('RoomMember.membership', roomJoinValidator);
    };

  });

  const [totalInvites] = useTotalInvites();

  return !getPrivacyRefuseRoom() && totalInvites !== 0 && (
    <SidebarAvatar
      tooltip="Invites"
      onClick={() => openInviteList()}
      avatar={<Avatar faSrc="bi bi-envelope-plus-fill" size="normal" />}
      notificationBadge={<NotificationBadge className={notificationClasses} alert content={totalInvites} />}
    />
  );

};
