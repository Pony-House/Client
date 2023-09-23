import React from 'react';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { getUsername, getUsernameOfRoomMember } from '../../../util/matrixUtil';

import JoinMessage from './chat-messages/Join';
import LeaveMessage from './chat-messages/Leave';

import InviteMessage from './chat-messages/Invite';
import CancelInviteMessage from './chat-messages/CancelInvite';
import RejectInviteMessage from './chat-messages/RejectInvite';

import BanMessage from './chat-messages/Ban';
import UnbanMessage from './chat-messages/Unban';

import AvatarSetsMessage from './chat-messages/AvatarSets';
import AvatarChangedMessage from './chat-messages/AvatarChanged';
import AvatarRemovedMessage from './chat-messages/AvatarRemoved';

import NameSetsMessage from './chat-messages/NameSets';
import NameChangedMessage from './chat-messages/NameChanged';
import NameRemovedMessage from './chat-messages/NameRemoved';

function getTimelineJSXMessages() {

  return {

    join(user) { return <JoinMessage user={user} />; },
    leave(user, reason) { return <LeaveMessage user={user} reason={reason} />; },

    invite(inviter, user) { return <InviteMessage user={user} inviter={inviter} />; },
    cancelInvite(inviter, user) { return <CancelInviteMessage user={user} inviter={inviter} />; },
    rejectInvite(user) { return <RejectInviteMessage user={user} />; },

    kick(actor, user, reason) { return <RejectInviteMessage actor={actor} user={user} reason={reason} />; },
    ban(actor, user, reason) { return <BanMessage actor={actor} user={user} reason={reason} />; },
    unban(actor, user) { return <UnbanMessage actor={actor} user={user} />; },

    avatarSets(user) { return <AvatarSetsMessage user={user} />; },
    avatarChanged(user) { return <AvatarChangedMessage user={user} />; },
    avatarRemoved(user) { return <AvatarRemovedMessage user={user} />; },

    nameSets(user, newName) { return <NameSetsMessage newName={newName} user={user} />; },
    nameChanged(user, newName) { return <NameChangedMessage newName={newName} user={user} />; },
    nameRemoved(user, lastName) { return <NameRemovedMessage lastName={lastName} user={user} />; },

  };

}

function getUsersActionJsx(roomId, userIds, actionStr) {
  const room = initMatrix.matrixClient.getRoom(roomId);
  const getUserDisplayName = (userId) => {
    if (room?.getMember(userId)) return getUsernameOfRoomMember(room.getMember(userId));
    return getUsername(userId);
  };
  const getUserJSX = (userId) => <strong>{twemojifyReact(getUserDisplayName(userId))}</strong>;
  if (!Array.isArray(userIds)) return 'Idle';
  if (userIds.length === 0) return 'Idle';
  const MAX_VISIBLE_COUNT = 3;

  const u1Jsx = (<span className='text-bg'>{getUserJSX(userIds[0])}</span>);
  // eslint-disable-next-line react/jsx-one-expression-per-line
  if (userIds.length === 1) return <>{u1Jsx} is {actionStr}</>;

  const u2Jsx = (<span className='text-bg'>{getUserJSX(userIds[1])}</span>);
  // eslint-disable-next-line react/jsx-one-expression-per-line
  if (userIds.length === 2) return <>{u1Jsx} and {u2Jsx} are {actionStr}</>;

  const u3Jsx = (<span className='text-bg'>{getUserJSX(userIds[2])}</span>);
  if (userIds.length === 3) {
    // eslint-disable-next-line react/jsx-one-expression-per-line
    return <>{u1Jsx}, {u2Jsx} and {u3Jsx} are {actionStr}</>;
  }

  const othersCount = userIds.length - MAX_VISIBLE_COUNT;
  // eslint-disable-next-line react/jsx-one-expression-per-line
  return <>{u1Jsx}, {u2Jsx}, {u3Jsx} and {othersCount} others are {actionStr}</>;
}

function parseTimelineChange(mEvent) {
  const tJSXMsgs = getTimelineJSXMessages();
  const makeReturnObj = (variant, content) => ({
    variant,
    content,
  });
  const content = mEvent.getContent();
  const prevContent = mEvent.getPrevContent();
  const sender = mEvent.getSender();
  const senderName = getUsername(sender);
  const userName = getUsername(mEvent.getStateKey());

  switch (content.membership) {
    case 'invite': return makeReturnObj('invite', tJSXMsgs.invite(senderName, userName));
    case 'ban': return makeReturnObj('leave', tJSXMsgs.ban(senderName, userName, content.reason));
    case 'join':
      if (prevContent.membership === 'join') {
        if (content.displayname !== prevContent.displayname) {
          if (typeof content.displayname === 'undefined') return makeReturnObj('avatar', tJSXMsgs.nameRemoved(sender, prevContent.displayname));
          if (typeof prevContent.displayname === 'undefined') return makeReturnObj('avatar', tJSXMsgs.nameSets(sender, content.displayname));
          return makeReturnObj('avatar', tJSXMsgs.nameChanged(prevContent.displayname, content.displayname));
        }
        if (content.avatar_url !== prevContent.avatar_url) {
          if (typeof content.avatar_url === 'undefined') return makeReturnObj('avatar', tJSXMsgs.avatarRemoved(content.displayname));
          if (typeof prevContent.avatar_url === 'undefined') return makeReturnObj('avatar', tJSXMsgs.avatarSets(content.displayname));
          return makeReturnObj('avatar', tJSXMsgs.avatarChanged(content.displayname));
        }
        return null;
      }
      return makeReturnObj('join', tJSXMsgs.join(senderName));
    case 'leave':
      if (sender === mEvent.getStateKey()) {
        switch (prevContent.membership) {
          case 'invite': return makeReturnObj('invite-cancel', tJSXMsgs.rejectInvite(senderName));
          default: return makeReturnObj('leave', tJSXMsgs.leave(senderName, content.reason));
        }
      }
      switch (prevContent.membership) {
        case 'invite': return makeReturnObj('invite-cancel', tJSXMsgs.cancelInvite(senderName, userName));
        case 'ban': return makeReturnObj('other', tJSXMsgs.unban(senderName, userName));
        // sender is not target and made the target leave,
        // if not from invite/ban then this is a kick
        default: return makeReturnObj('leave', tJSXMsgs.kick(senderName, userName, content.reason));
      }
    default: return null;
  }
}

export {
  getTimelineJSXMessages,
  getUsersActionJsx,
  parseTimelineChange,
};
