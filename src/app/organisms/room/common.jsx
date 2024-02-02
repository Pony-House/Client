import React from 'react';

import { twemojifyReact } from '../../../util/twemojify';
import { getAppearance } from '../../../util/libs/appearance';

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

import PinnedEventsMessage, { comparePinEvents } from './chat-messages/PinnedEventsMessage';

function getTimelineJSXMessages() {
  return {
    join(date, user) {
      return <JoinMessage date={date} user={user} />;
    },
    leave(date, user, reason) {
      return <LeaveMessage date={date} user={user} reason={reason} />;
    },

    invite(date, inviter, user) {
      return <InviteMessage date={date} user={user} inviter={inviter} />;
    },
    cancelInvite(date, inviter, user) {
      return <CancelInviteMessage date={date} user={user} inviter={inviter} />;
    },
    rejectInvite(date, user) {
      return <RejectInviteMessage date={date} user={user} />;
    },

    kick(date, actor, user, reason) {
      return <RejectInviteMessage date={date} actor={actor} user={user} reason={reason} />;
    },
    ban(date, actor, user, reason) {
      return <BanMessage date={date} actor={actor} user={user} reason={reason} />;
    },
    unban(date, actor, user) {
      return <UnbanMessage date={date} actor={actor} user={user} />;
    },

    avatarSets(date, user) {
      return <AvatarSetsMessage date={date} user={user} />;
    },
    avatarChanged(date, user) {
      return <AvatarChangedMessage date={date} user={user} />;
    },
    avatarRemoved(date, user) {
      return <AvatarRemovedMessage date={date} user={user} />;
    },

    nameSets(date, user, newName) {
      return <NameSetsMessage date={date} newName={newName} user={user} />;
    },
    nameChanged(date, user, newName) {
      return <NameChangedMessage date={date} newName={newName} user={user} />;
    },
    nameRemoved(date, user, lastName) {
      return <NameRemovedMessage date={date} lastName={lastName} user={user} />;
    },

    pinnedEvents(date, user, comparedPinMessages, room) {
      return (
        <PinnedEventsMessage
          date={date}
          comparedPinMessages={comparedPinMessages}
          user={user}
          room={room}
        />
      );
    },
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

  const u1Jsx = <span className="text-bg">{getUserJSX(userIds[0])}</span>;
  // eslint-disable-next-line react/jsx-one-expression-per-line
  if (userIds.length === 1)
    return (
      <>
        {u1Jsx} is {actionStr}
      </>
    );

  const u2Jsx = <span className="text-bg">{getUserJSX(userIds[1])}</span>;
  // eslint-disable-next-line react/jsx-one-expression-per-line
  if (userIds.length === 2)
    return (
      <>
        {u1Jsx} and {u2Jsx} are {actionStr}
      </>
    );

  const u3Jsx = <span className="text-bg">{getUserJSX(userIds[2])}</span>;
  if (userIds.length === 3) {
    // eslint-disable-next-line react/jsx-one-expression-per-line
    return (
      <>
        {u1Jsx}, {u2Jsx} and {u3Jsx} are {actionStr}
      </>
    );
  }

  const othersCount = userIds.length - MAX_VISIBLE_COUNT;
  // eslint-disable-next-line react/jsx-one-expression-per-line
  return (
    <>
      {u1Jsx}, {u2Jsx}, {u3Jsx} and {othersCount} others are {actionStr}
    </>
  );
}

function parseTimelineChange(mEvent) {
  const tJSXMsgs = getTimelineJSXMessages();
  const makeReturnObj = (variant, content) => ({
    variant,
    content,
  });

  const appearanceSettings = getAppearance();
  const mx = initMatrix.matrixClient;

  const type = mEvent.getType();
  const date = mEvent.getDate();
  const content = mEvent.getContent();
  const prevContent = mEvent.getPrevContent();
  const sender = mEvent.getSender();
  const senderName = getUsername(sender);
  const userName = getUsername(mEvent.getStateKey());

  if (type !== 'm.room.pinned_events') {
    switch (content.membership) {
      case 'invite':
        return makeReturnObj('invite', tJSXMsgs.invite(date, senderName, userName));
      case 'ban':
        return makeReturnObj('leave', tJSXMsgs.ban(date, senderName, userName, content.reason));

      case 'join':
        if (prevContent.membership === 'join') {
          if (content.displayname !== prevContent.displayname) {
            if (typeof content.displayname === 'undefined')
              return makeReturnObj(
                date,
                'avatar',
                tJSXMsgs.nameRemoved(date, sender, prevContent.displayname),
              );
            if (typeof prevContent.displayname === 'undefined')
              return makeReturnObj(
                date,
                'avatar',
                tJSXMsgs.nameSets(date, sender, content.displayname),
              );
            return makeReturnObj(
              'avatar',
              tJSXMsgs.nameChanged(date, prevContent.displayname, content.displayname),
            );
          }
          if (content.avatar_url !== prevContent.avatar_url) {
            if (typeof content.avatar_url === 'undefined')
              return makeReturnObj('avatar', tJSXMsgs.avatarRemoved(date, content.displayname));
            if (typeof prevContent.avatar_url === 'undefined')
              return makeReturnObj('avatar', tJSXMsgs.avatarSets(date, content.displayname));
            return makeReturnObj('avatar', tJSXMsgs.avatarChanged(date, content.displayname));
          }
          return null;
        }
        return makeReturnObj('join', tJSXMsgs.join(date, senderName));

      case 'leave':
        if (sender === mEvent.getStateKey()) {
          switch (prevContent.membership) {
            case 'invite':
              return makeReturnObj('invite-cancel', tJSXMsgs.rejectInvite(date, senderName));
            default:
              return makeReturnObj('leave', tJSXMsgs.leave(date, senderName, content.reason));
          }
        }
        switch (prevContent.membership) {
          case 'invite':
            return makeReturnObj(
              'invite-cancel',
              tJSXMsgs.cancelInvite(date, senderName, userName),
            );
          case 'ban':
            return makeReturnObj('other', tJSXMsgs.unban(date, senderName, userName));
          // sender is not target and made the target leave,
          // if not from invite/ban then this is a kick
          default:
            return makeReturnObj(
              'leave',
              tJSXMsgs.kick(date, senderName, userName, content.reason),
            );
        }

      default:
        return null;
    }
  }

  // Pin Messages
  if (typeof mEvent.getStateKey() === 'string') {
    const comparedPinMessages = comparePinEvents(content, mEvent.getPrevContent());

    if (
      (comparedPinMessages.added.length > 0 && !appearanceSettings.hidePinMessageEvents) ||
      (comparedPinMessages.removed.length > 0 && !appearanceSettings.hideUnpinMessageEvents)
    ) {
      return makeReturnObj(
        `pinned-events-${comparedPinMessages.added.length > 0 ? 'added' : 'removed'}`,
        tJSXMsgs.pinnedEvents(
          date,
          senderName,
          comparedPinMessages,
          mx.getRoom(mEvent.getRoomId()),
        ),
      );
    }

    return null;
  }

  // Nothing
  return null;
}

export { getTimelineJSXMessages, getUsersActionJsx, parseTimelineChange };
