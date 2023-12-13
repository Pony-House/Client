import React, { useEffect } from 'react';
import { openInviteList } from '../../../../client/action/navigation';

import Avatar from '../../../atoms/avatar/Avatar';
import SidebarAvatar from '../../../molecules/sidebar-avatar/SidebarAvatar';

import initMatrix from '../../../../client/initMatrix';
import { notificationClasses } from './Notification';
import NotificationBadge from '../../../atoms/badge/NotificationBadge';
import { useTotalInvites } from './FeaturedTab';

// Notification Update
export default function InviteSidebar() {

  const mx = initMatrix.matrixClient;
  useEffect(() => {

    const roomJoinValidator = (event, member) => {

      if (member.membership === "invite" && member.userId === mx.getUserId()) {
        // mx.joinRoom(member.roomId);
      }

    };

    mx.on('RoomMember.membership', roomJoinValidator);
    return () => {
      mx.removeListener('RoomMember.membership', roomJoinValidator);
    };

  });

  const [totalInvites] = useTotalInvites();

  return totalInvites !== 0 && (
    <SidebarAvatar
      tooltip="Invites"
      onClick={() => openInviteList()}
      avatar={<Avatar faSrc="bi bi-envelope-plus-fill" size="normal" />}
      notificationBadge={<NotificationBadge className={notificationClasses} alert content={totalInvites} />}
    />
  );

};
