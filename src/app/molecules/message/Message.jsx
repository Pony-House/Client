/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  MatrixEventEvent,
  RoomEvent,
  THREAD_RELATION_TYPE,
} from 'matrix-js-sdk';

import clone from 'clone';
import hljs from 'highlight.js';
import * as linkify from "linkifyjs";

import Text from '../../atoms/text/Text';
import { hljsFixer, resizeWindowChecker, chatboxScrollToBottom, toast } from '../../../util/tools';
import { twemojifyReact } from '../../../util/twemojify';


import initMatrix from '../../../client/initMatrix';

import settings from '../../../client/state/settings';
import {
  getUsername,
  getUsernameOfRoomMember,
  parseReply,
  trimHTMLReply,
  getCurrentState,
} from '../../../util/matrixUtil';

import { colorMXID, backgroundColorMXID } from '../../../util/colorMXID';
import { getEventCords, copyToClipboard } from '../../../util/common';
import { redactEvent, sendReaction } from '../../../client/action/roomTimeline';
import {
  openEmojiBoard,
  openProfileViewer,
  openReadReceipts,
  openViewSource,
  replyTo,
  selectRoom,
  openReusableContextMenu,
} from '../../../client/action/navigation';
import { sanitizeCustomHtml } from '../../../util/sanitize';

import { shiftNuller } from '../../../util/shortcut';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Button from '../../atoms/button/Button';
import Tooltip from '../../atoms/tooltip/Tooltip';
import Input from '../../atoms/input/Input';
import Avatar from '../../atoms/avatar/Avatar';
import IconButton from '../../atoms/button/IconButton';
import Time from '../../atoms/time/Time';
import ContextMenu, {
  MenuHeader,
  MenuItem,
  MenuBorder,
} from '../../atoms/context-menu/ContextMenu';
import * as Media from '../media/Media';

import { confirmDialog } from '../confirm-dialog/ConfirmDialog';
import { getBlobSafeMimeType } from '../../../util/mimetypes';
import { html, plain } from '../../../util/markdown';
import getUrlPreview from '../../../util/libs/getUrlPreview';

import Embed from './Embed';
import tinyAPI from '../../../util/mods';
import { getAnimatedImageUrl, getAppearance } from '../../../util/libs/appearance';
import UserOptions from '../user-options/UserOptions';
import { getDataList } from '../../../util/selectedRoom';
import { tinyLinkifyFixer } from '../../../util/clear-urls/clearUrls';

function PlaceholderMessage() {
  return <tr className="ph-msg">
    <td colSpan="2">
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      <p className="placeholder-glow"><span className="placeholder col-12" /></p>
    </td>
  </tr>;
};

// Avatar Generator
const MessageAvatar = React.memo(({
  roomId, avatarSrc, avatarAnimSrc, userId, username, contextMenu,
}) => (
  <button type="button" onContextMenu={contextMenu} onClick={() => openProfileViewer(userId, roomId)}>
    <Avatar imgClass='' imageAnimSrc={avatarAnimSrc} imageSrc={avatarSrc} text={username} bgColor={colorMXID(userId)} isDefaultImage />
  </button>
));

// Message Header
const MessageHeader = React.memo(
  ({
    userId,
    username,
  }) => {

    const appAppearance = getAppearance();
    const tinyUsername = twemojifyReact(username);

    return (
      <span className='username-base emoji-size-fix' style={{ color: colorMXID(userId) }}>
        <span className={`username${appAppearance.isUNhoverEnabled ? '' : ' disable-username'}`}>{tinyUsername}</span>
        <span className={`user-id${appAppearance.isUNhoverEnabled ? '' : ' disable-username'}`}>{appAppearance.isUNhoverEnabled ? twemojifyReact(userId) : tinyUsername}</span>
      </span>
    );

  },
);

MessageHeader.propTypes = {
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

const MessageTime = React.memo(({
  timestamp, fullTime, className
}) => (
  <span className={`${className} very-small text-gray`}>
    <Time timestamp={timestamp} fullTime={fullTime} />
  </span>
));

MessageTime.defaultProps = {
  fullTime: false,
  className: '',
};

MessageTime.propTypes = {
  timestamp: PropTypes.number.isRequired,
  fullTime: PropTypes.bool,
  className: PropTypes.string,
};

// Message Reply
function MessageReply({ name, color, body }) {
  return <div className="pb-2 emoji-size-fix small text-reply">
    <RawIcon color={color} size="normal" fa="fa-solid fa-reply" />
    {' '}
    <span className="username-title emoji-size-fix" style={{ color }}>{twemojifyReact(name)}</span>
    {' '}
    {body.length > 200 ? twemojifyReact(`${body.substring(0, 200)}......`) : twemojifyReact(body)}
  </div>;
}

MessageReply.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

const MessageReplyWrapper = React.memo(
  ({ roomTimeline, eventId }) => {
    const [reply, setReply] = useState(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
      const mx = initMatrix.matrixClient;
      const timelineSet = roomTimeline.getUnfilteredTimelineSet();
      const loadReply = async () => {
        try {
          const eTimeline = await mx.getEventTimeline(timelineSet, eventId);
          if (!eTimeline) return;
          await roomTimeline.decryptAllEventsOfTimeline(eTimeline);

          let mEvent = eTimeline.getTimelineSet().findEventById(eventId);

          const editedList = roomTimeline.editedTimeline.get(mEvent.getId());
          if (editedList) {
            mEvent = editedList[editedList.length - 1];
          }

          const rawBody = mEvent.getContent().body;
          const username = getUsernameOfRoomMember(mEvent.sender);

          if (isMountedRef.current === false) return;
          const fallbackBody = mEvent.isRedacted()
            ? '*** This message has been deleted ***'
            : '*** Unable to load reply ***';
          let parsedBody = parseReply(rawBody)?.body ?? rawBody ?? fallbackBody;
          if (editedList && parsedBody.startsWith(' * ')) {
            parsedBody = parsedBody.slice(3);
          }

          setReply({
            to: username,
            color: colorMXID(mEvent.getSender() ?? ''),
            body: parsedBody,
            event: mEvent,
          });
        } catch {
          setReply({
            to: '** Unknown user **',
            color: 'var(--tc-danger-normal)',
            body: '*** Unable to load reply ***',
            event: null,
          });
        }
      };
      loadReply();

      return () => {
        isMountedRef.current = false;
      };
    }, [eventId, roomTimeline]);

    const focusReply = (ev) => {
      if (!ev.key || ev.key === ' ' || ev.key === 'Enter') {
        if (ev.key) ev.preventDefault();
        if (reply?.event === null) return;
        if (reply?.event.isRedacted()) return;
        roomTimeline.loadEventTimeline(eventId);
      }
    };

    return (
      <div
        className="message__reply-wrapper"
        onClick={focusReply}
        onKeyDown={focusReply}
        role="button"
        tabIndex={0}
      >
        {reply !== null && <MessageReply name={reply.to} color={reply.color} body={reply.body} />}
      </div>
    );
  },
);

MessageReplyWrapper.propTypes = {
  roomTimeline: PropTypes.shape({}).isRequired,
  eventId: PropTypes.string.isRequired,
};

// Message Body
const MessageBody = React.memo(
  ({
    content,
    className,
    senderName,
    body,
    isCustomHTML,
    isSystem,
    isEdited,
    msgType,
    messageStatus,
  }) => {

    const messageBody = useRef(null);

    useEffect(() => {
      $(messageBody.current).find('pre code').each((index, value) => {

        const el = $(value);
        resizeWindowChecker();

        if (!el.hasClass('hljs')) {
          hljs.highlightElement(value);
          el.addClass('chatbox-size-fix');
        }

        if (!el.hasClass('hljs-fix')) {
          el.addClass('hljs-fix');
          hljsFixer(el, 'MessageBody');
        }

        if (!el.hasClass('hljs')) {
          el.addClass('hljs');
        }

      });

      // Add tooltip on the emoji
      $(messageBody.current).find('[data-mx-emoticon], .emoji').each((index, value) => {

        const el = $(value);

        if (!el.hasClass('emoji-fix')) {

          if (!el.attr('title') && el.attr('alt')) el.attr('title', el.attr('alt'));

          new bootstrap.Tooltip(value, { customClass: 'small' });
          el.addClass('emoji-fix');

        }

      });
    });

    // if body is not string it is a React element.
    if (typeof body !== 'string') return <div className="message__body">{body}</div>;

    let msgData = null;
    if (isCustomHTML) {
      try {

        const insertMsg = () => twemojifyReact(
          sanitizeCustomHtml(initMatrix.matrixClient, body),
          undefined,
          true,
          false,
          true,
        );

        const msgOptions = tinyAPI.emit('messageBody', content, insertMsg);

        if (typeof msgOptions.custom === 'undefined') {
          msgData = insertMsg();
        } else {
          msgData = msgOptions.custom;
        }

      } catch {
        console.error(`[matrix] [msg] Malformed custom html: `, body);
        msgData = twemojifyReact(body, undefined);
      }
    } else if (!isSystem) {
      msgData = twemojifyReact(body, undefined, true);
    } else {
      msgData = twemojifyReact(body, undefined, true, false, true);
    }

    // Determine if this message should render with large emojis
    // Criteria:
    // - Contains only emoji
    // - Contains no more than 10 emoji
    let emojiOnly = false;
    const msgContent = msgData?.props?.children?.props?.children;
    if (msgContent) {
      if (msgContent.type === 'img') {
        // If this messages contains only a single (inline) image
        emojiOnly = true;
      } else if (msgContent.constructor.name === 'Array') {
        // Otherwise, it might be an array of images / texb

        // Count the number of emojis
        const nEmojis = msgContent.filter((e) => e.type === 'img').length;

        // Make sure there's no text besides whitespace and variation selector U+FE0F
        if (nEmojis <= 10 && msgContent.every((element) => (
          (typeof element === 'object' && element.type === 'img')
          || (typeof element === 'string' && /^[\s\ufe0f]*$/g.test(element))
        ))) {
          emojiOnly = true;
        }
      }
    }

    if (!isCustomHTML) {
      // If this is a plaintext message, wrap it in a <p> element (automatically applying
      // white-space: pre-wrap) in order to preserve newlines
      msgData = (<p ref={messageBody} className="m-0">{msgData}</p>);
    } else {
      msgData = (<span ref={messageBody} className="custom-html">{msgData}</span>);
    }

    return <div className={`text-freedom message-body small text-bg${!emojiOnly ? ' emoji-size-fix' : ''} ${className} message-body-status-${messageStatus}`}>
      {msgType === 'm.emote' && (
        <>
          {'* '}
          {twemojifyReact(senderName)}
          {' '}
        </>
      )}
      {msgData}
      {isEdited && <div className="very-small text-gray">(edited)</div>}
    </div>;
  },
);

MessageBody.defaultProps = {
  className: '',
  isCustomHTML: false,
  isSystem: false,
  isEdited: false,
  msgType: null,
  content: {},
};
MessageBody.propTypes = {
  content: PropTypes.object,
  senderName: PropTypes.string.isRequired,
  body: PropTypes.node.isRequired,
  isSystem: PropTypes.bool,
  isCustomHTML: PropTypes.bool,
  isEdited: PropTypes.bool,
  msgType: PropTypes.string,
  className: PropTypes.string,
};

// Message Edit
function MessageEdit({ body, onSave, onCancel }) {
  const editInputRef = useRef(null);

  useEffect(() => {
    // makes the cursor end up at the end of the line instead of the beginning
    editInputRef.current.value = '';
    editInputRef.current.value = body;
  }, [body]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }

    if (e.key === 'Enter' && settings.sendMessageOnEnter && e.shiftKey === false) {
      e.preventDefault();
      onSave(editInputRef.current.value, body);
    }
  };

  return <form
    className="message__edit"
    onSubmit={(e) => {
      e.preventDefault();
      onSave(editInputRef.current.value, body);
    }}
  >
    <Input
      forwardRef={editInputRef}
      onKeyDown={handleKeyDown}
      value={body}
      placeholder="Edit message"
      required
      resizable
      autoFocus
    />
    <div className="message__edit-btns">
      <Button type="submit" variant="primary">
        Save
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  </form>;
}
MessageEdit.propTypes = {
  body: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Get Emoji
function getMyEmojiEvent(
  emojiKey,
  eventId,
  roomTimeline,
) {
  const mx = initMatrix.matrixClient;
  const rEvents = roomTimeline.reactionTimeline.get(eventId);
  let rEvent = null;
  rEvents?.find((rE) => {
    if (rE.getRelation() === null) return false;
    if (rE.getRelation().key === emojiKey && rE.getSender() === mx.getUserId()) {
      rEvent = rE;
      return true;
    }
    return false;
  });
  return rEvent;
}

function toggleEmoji(
  roomId,
  eventId,
  emojiKey,
  shortcode,
  roomTimeline,
) {
  const myAlreadyReactEvent = getMyEmojiEvent(emojiKey, eventId, roomTimeline);
  if (myAlreadyReactEvent) {
    const rId = myAlreadyReactEvent.getId();
    if (rId.startsWith('~')) return;
    redactEvent(roomId, rId);
    return;
  }
  sendReaction(roomId, eventId, emojiKey, shortcode);
}

// Pick Emoji Modal
function pickEmoji(
  e,
  roomId,
  eventId,
  roomTimeline,
  extraX = 0,
  extraX2 = 0,
) {

  // Get Cords
  const cords = getEventCords(e);

  // Mobile Screen - Viewport
  cords.y -= 170;
  if (window.matchMedia('screen and (max-width: 479px)').matches) {
    cords.x -= 230 + extraX2;
  }

  // Normal Screen
  else {
    cords.x -= 430 + extraX;
  }

  if (Math.round(cords.y) >= document.body.offsetHeight - 340) {
    cords.y -= 260;
  }

  // Open the Emoji Board
  openEmojiBoard(roomId, cords, 'emoji', (emoji) => {
    toggleEmoji(roomId, eventId, emoji.mxc ?? emoji.unicode, emoji.shortcodes[0], roomTimeline);
    shiftNuller(() => e.target.click());
  });

}

// Reaction Generator
function genReactionMsg(userIds, reaction, shortcode) {
  return <>
    {userIds.map((userId, index) => (
      <React.Fragment key={userId}>
        <span className='emoji-size-fix-2'>{twemojifyReact(getUsername(userId))}</span>
        {index < userIds.length - 1 && (
          <span style={{ opacity: '.6' }}>
            {index === userIds.length - 2 ? ' and ' : ', '}
          </span>
        )}
      </React.Fragment>
    ))}
    <span style={{ opacity: '.6' }}>{' reacted with '}</span>
    <span className='emoji-size-fix-2'>{twemojifyReact(shortcode ? `:${shortcode}:` : reaction, { className: 'react-emoji' })}</span>
  </>;
}

// Reaction Manager
function MessageReaction({
  reaction, shortcode, count, users, isActive, onClick,
}) {
  let customEmojiUrl = null;
  if (reaction.match(/^mxc:\/\/\S+$/)) {
    customEmojiUrl = initMatrix.matrixClient.mxcUrlToHttp(reaction);
  }
  return <Tooltip
    className="msg__reaction-tooltip"
    content={<div className='small'>{users.length > 0 ? genReactionMsg(users, reaction, shortcode) : 'Unable to load who has reacted'}</div>}
  >
    <button
      onClick={onClick}
      type="button"
      className={`msg__reaction${isActive ? ' msg__reaction--active' : ''}`}
    >
      {
        customEmojiUrl
          ? <img className="react-emoji" draggable="false" alt={shortcode ?? reaction} src={customEmojiUrl} />
          : twemojifyReact(reaction, { className: 'react-emoji' })
      }
      <div className="very-small text-gray msg__reaction-count">{count}</div>
    </button>
  </Tooltip>;
}
MessageReaction.defaultProps = {
  shortcode: undefined,
};
MessageReaction.propTypes = {
  reaction: PropTypes.node.isRequired,
  shortcode: PropTypes.string,
  count: PropTypes.number.isRequired,
  users: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function MessageReactionGroup({ roomTimeline, mEvent }) {
  const { roomId, room, reactionTimeline } = roomTimeline;
  const mx = initMatrix.matrixClient;
  const reactions = {};
  const canSendReaction = getCurrentState(room).maySendEvent('m.reaction', mx.getUserId());

  const eventReactions = reactionTimeline.get(mEvent.getId());
  const addReaction = (key, shortcode, count, senderId, isActive) => {
    let reaction = reactions[key];
    if (reaction === undefined) {
      reaction = {
        count: 0,
        users: [],
        isActive: false,
      };
    }
    if (shortcode) reaction.shortcode = shortcode;
    if (count) {
      reaction.count = count;
    } else {
      reaction.users.push(senderId);
      reaction.count = reaction.users.length;
      if (isActive) reaction.isActive = isActive;
    }

    reactions[key] = reaction;
  };
  if (eventReactions) {
    eventReactions.forEach((rEvent) => {
      if (rEvent.getRelation() === null) return;
      const reaction = rEvent.getRelation();
      const senderId = rEvent.getSender();
      const { shortcode } = rEvent.getContent();
      const isActive = senderId === mx.getUserId();

      addReaction(reaction.key, shortcode, undefined, senderId, isActive);
    });
  } else {
    // Use aggregated reactions
    const aggregatedReaction = mEvent.getServerAggregatedRelation('m.annotation')?.chunk;
    if (!aggregatedReaction) return null;
    aggregatedReaction.forEach((reaction) => {
      if (reaction.type !== 'm.reaction') return;
      addReaction(reaction.key, undefined, reaction.count, undefined, false);
    });
  }

  return (
    <div className="noselect">
      {
        Object.keys(reactions).map((key) => (
          <MessageReaction
            key={key}
            reaction={key}
            shortcode={reactions[key].shortcode}
            count={reactions[key].count}
            users={reactions[key].users}
            isActive={reactions[key].isActive}
            onClick={() => {
              toggleEmoji(roomId, mEvent.getId(), key, reactions[key].shortcode, roomTimeline);
            }}
          />
        ))
      }
      {canSendReaction && (
        <IconButton
          className='ms-2 btn-sm reaction-message'
          onClick={(e) => {
            pickEmoji(e, roomId, mEvent.getId(), roomTimeline, -430);
          }}
          fa="fa-solid fa-heart-circle-plus"
          size="normal"
          tooltip="Add reaction"
        />
      )}
    </div>
  );
}
MessageReactionGroup.propTypes = {
  roomTimeline: PropTypes.shape({}).isRequired,
  mEvent: PropTypes.shape({}).isRequired,
};

// Detect Media
function isMedia(mE) {
  return (
    mE.getContent()?.msgtype === 'm.file'
    || mE.getContent()?.msgtype === 'm.image'
    || mE.getContent()?.msgtype === 'm.audio'
    || mE.getContent()?.msgtype === 'm.video'
    || mE.getType() === 'm.sticker'
  );
}

function shouldShowThreadSummary(mEvent, roomTimeline) {
  return (
    mEvent.isThreadRoot &&
    // there must be events in the threadW
    (mEvent.getThread()?.length ?? 0) > 0 &&
    // don't show the thread summary if we're in a thread
    roomTimeline.thread === undefined
  );
}

// if editedTimeline has mEventId then pass editedMEvent else pass mEvent to openViewSource
function handleOpenViewSource(mEvent, roomTimeline) {
  const eventId = mEvent.getId();
  const { editedTimeline } = roomTimeline ?? {};
  let editedMEvent;
  if (editedTimeline?.has(eventId)) {
    const editedList = editedTimeline.get(eventId);
    editedMEvent = editedList[editedList.length - 1];
  }
  openViewSource(editedMEvent !== undefined ? editedMEvent : mEvent);
}

const MessageOptions = React.memo(
  ({
    roomTimeline,
    mEvent,
    edit,
    reply,
    roomid,
    senderid,
    eventid,
    msgtype,
    body,
    customHTML,
  }) => {
    const { roomId, room } = roomTimeline;
    const mx = initMatrix.matrixClient;
    const senderId = mEvent.getSender();
    const eventId = mEvent.getId();
    if (!eventId) {
      console.warn('Message without id', mEvent);
      return null;
    }

    const myUserId = mx.getUserId();
    if (!myUserId) {
      console.warn('No user id in MessageOptions, this should not be possible');
      return null;
    }

    const myPowerlevel = room.getMember(myUserId)?.powerLevel;
    const canIRedact = room.currentState.hasSufficientPowerLevelFor('redact', myPowerlevel);
    const canSendReaction = room.currentState.maySendEvent('m.reaction', myUserId);
    const canCreateThread =
      room.currentState.maySendEvent('m.thread', myUserId) &&
      // this message is already a thread
      !shouldShowThreadSummary(mEvent, roomTimeline) &&
      // can't create threads in threads
      roomTimeline.thread === undefined;

    const createThread = () => {
      room.createThread(eventId, mEvent, [mEvent], true);
      selectRoom(roomId, eventId, eventId);
    };

    return (
      <div className="message__options">
        {canSendReaction && (
          <IconButton
            onClick={(e) => pickEmoji(e, roomId, eventId, roomTimeline)}
            fa="fa-solid fa-heart-circle-plus"
            size="normal"
            tooltip="Add reaction"
          />
        )}
        <IconButton
          onClick={() => reply()}
          fa="fa-solid fa-reply"
          size="normal"
          tooltip="Reply"
        />

        {canCreateThread && (
          <IconButton
            onClick={() => createThread()}
            fa="bi bi-layers"
            size="normal"
            tooltip="Create thread"
          />
        )}

        {(senderId === mx.getUserId() && !isMedia(mEvent)) && (
          <IconButton
            onClick={() => edit(true)}
            fa="fa-solid fa-pencil"
            size="normal"
            tooltip="Edit"
          />
        )}

        {(canIRedact || senderId === mx.getUserId()) && (
          <IconButton
            className='need-shift'
            onClick={() => redactEvent(roomId, mEvent.getId())}
            fa="fa-solid fa-trash-can btn-text-danger"
            size="normal"
            tooltip="Delete"
          />
        )}
        <ContextMenu
          content={() => (
            <>
              <MenuHeader>Options</MenuHeader>

              <MenuItem
                className="text-start"
                faSrc="fa-solid fa-copy"
                onClick={() => {
                  const messageBody = $(`[roomid='${roomid}'][senderid='${senderid}'][eventid='${eventid}'][msgtype='${msgtype}'] .message-body`);
                  if (messageBody.length > 0) {
                    copyToClipboard((customHTML
                      ? html(customHTML, { kind: 'edit', onlyPlain: true }).plain
                      : plain(body, { kind: 'edit', onlyPlain: true }).plain));
                    toast('Text successfully copied to the clipboard.');
                  } else {
                    toast('No text was found in this message.');
                  }
                }}
              >
                Copy text
              </MenuItem>

              <MenuItem
                className="text-start"
                faSrc="fa-solid fa-check-double"
                onClick={() => openReadReceipts(roomId, roomTimeline.getEventReaders(mEvent))}
              >
                Read receipts
              </MenuItem>

              <MenuItem
                className="text-start"
                faSrc="fa-solid fa-code"
                onClick={() => handleOpenViewSource(mEvent, roomTimeline)}
              >
                View source
              </MenuItem>

              {(canIRedact || senderId === mx.getUserId()) && (
                <>
                  <MenuBorder />
                  <MenuItem
                    className="text-start btn-text-danger"
                    faSrc="fa-solid fa-trash-can"
                    onClick={async () => {
                      const isConfirmed = await confirmDialog(
                        'Delete message',
                        'Are you sure that you want to delete this message?',
                        'Delete',
                        'danger',
                      );
                      if (!isConfirmed) return;
                      redactEvent(roomId, mEvent.getId());
                    }}
                  >
                    Delete
                  </MenuItem>
                </>
              )}
            </>
          )}

          render={(toggleMenu) => (
            <IconButton
              onClick={toggleMenu}
              fa="bi bi-three-dots-vertical"
              size="normal"
              tooltip="Options"
            />
          )}

        />
      </div>
    );
  },
);

// Options Default
MessageOptions.propTypes = {
  roomid: PropTypes.string,
  senderid: PropTypes.string,
  eventid: PropTypes.string,
  msgtype: PropTypes.string,
  roomTimeline: PropTypes.shape({}).isRequired,
  mEvent: PropTypes.shape({}).isRequired,
  edit: PropTypes.func.isRequired,
  reply: PropTypes.func.isRequired,
};

// Thread
const MessageThreadSummary = React.memo(({ thread }) => {
  const [lastReply, setLastReply] = useState(thread.lastReply());

  // can't have empty threads
  if (thread.length === 0) return null;

  const lastSender = lastReply?.sender;
  const lastSenderAvatarSrc =
    lastSender?.getAvatarUrl(initMatrix.matrixClient.baseUrl, 36, 36, 'crop', true, false) ??
    undefined;

  function selectThread() {
    selectRoom(thread.roomId, undefined, thread.rootEvent?.getId());
  }

  thread.on(RoomEvent.Timeline, () => {
    setLastReply(thread.lastReply());
  });

  return <button className="message__threadSummary p-2 small" onClick={selectThread} type="button">
    <div className="message__threadSummary-count">
      <Text>
        {thread.length} message{thread.length > 1 ? 's' : ''} ›
      </Text>
    </div>
    <div className="message__threadSummary-lastReply text-truncate text-white">
      {lastReply ? (
        <>
          {lastSender ? (
            <>
              <Avatar
                imageSrc={lastSenderAvatarSrc}
                text={lastSender?.name}
                bgColor={backgroundColorMXID(lastSender?.userId)}
                size="ultra-small"
              />
              <span className="message__threadSummary-lastReply-sender very-small text-truncate">
                {lastSender?.name}{' '}
              </span>
            </>
          ) : (
            <span className="message__threadSummary-lastReply-sender very-small text-truncate">
              Unknown user{' '}
            </span>
          )}
          <span className="message__threadSummary-lastReply-body very-small text-truncate">
            {lastReply.getContent().body}
          </span>
        </>
      ) : (
        <Text>Couldn&apos;t load latest message</Text>
      )}
    </div>
  </button>;
});

// Media Generator
function genMediaContent(mE) {

  // Client
  const mx = initMatrix.matrixClient;
  const mContent = mE.getContent();
  if (!mContent || !mContent.body)
    return <span style={{ color: 'var(--bg-danger)' }}>Malformed event</span>;

  // Content URL
  let mediaMXC = mContent?.url;
  const isEncryptedFile = typeof mediaMXC === 'undefined';
  if (isEncryptedFile) mediaMXC = mContent?.file?.url;

  // Thumbnail
  let thumbnailMXC = mContent?.info?.thumbnail_url;

  // Bad Event Again
  if (typeof mediaMXC === 'undefined' || mediaMXC === '')
    return <span style={{ color: 'var(--bg-danger)' }}>Malformed event</span>;

  // Content Type
  let msgType = mE.getContent()?.msgtype;
  const safeMimetype = getBlobSafeMimeType(mContent.info?.mimetype);

  // Sticker
  if (mE.getType() === 'm.sticker') {
    msgType = 'm.sticker';
  }

  // File
  else if (safeMimetype === 'application/octet-stream') {
    msgType = 'm.file';
  }

  const blurhash = mContent?.info?.['xyz.amorgan.blurhash'];

  switch (msgType) {

    // File
    case 'm.file':
      return (
        <Media.File
          name={mContent.body}
          link={mx.mxcUrlToHttp(mediaMXC)}
          type={mContent.info?.mimetype}
          file={mContent.file || null}
        />
      );

    // Image
    case 'm.image':
      return (
        <Media.Image
          name={mContent.body}
          width={typeof mContent.info?.w === 'number' ? mContent.info?.w : null}
          height={typeof mContent.info?.h === 'number' ? mContent.info?.h : null}
          link={mx.mxcUrlToHttp(mediaMXC)}
          file={isEncryptedFile ? mContent.file : null}
          type={mContent.info?.mimetype}
          blurhash={blurhash}
        />
      );

    // Sticker
    case 'm.sticker':
      return (
        <Media.Sticker
          name={mContent.body}
          width={typeof mContent.info?.w === 'number' && !Number.isNaN(mContent.info?.w) ? mContent.info?.w : null}
          height={typeof mContent.info?.h === 'number' && !Number.isNaN(mContent.info?.h) ? mContent.info?.h : null}
          link={mx.mxcUrlToHttp(mediaMXC)}
          file={isEncryptedFile ? mContent.file : null}
          type={mContent.info?.mimetype}
        />
      );

    // Audio
    case 'm.audio':
      return (
        <Media.Audio
          name={mContent.body}
          link={mx.mxcUrlToHttp(mediaMXC)}
          type={mContent.info?.mimetype}
          file={mContent.file || null}
        />
      );

    // Video
    case 'm.video':
      if (typeof thumbnailMXC === 'undefined') {
        thumbnailMXC = mContent.info?.thumbnail_file?.url || null;
      }
      return (
        <Media.Video
          name={mContent.body}
          link={mx.mxcUrlToHttp(mediaMXC)}
          thumbnail={thumbnailMXC === null ? null : mx.mxcUrlToHttp(thumbnailMXC)}
          thumbnailFile={isEncryptedFile ? mContent.info?.thumbnail_file : null}
          thumbnailType={mContent.info?.thumbnail_info?.mimetype || null}
          width={typeof mContent.info?.w === 'number' ? mContent.info?.w : null}
          height={typeof mContent.info?.h === 'number' ? mContent.info?.h : null}
          file={isEncryptedFile ? mContent.file : null}
          type={mContent.info?.mimetype}
          blurhash={blurhash}
        />
      );

    // Bad Event Again?
    default:
      return <span style={{ color: 'var(--bg-danger)' }}>Malformed event</span>;

  }
}

function getEditedBody(editedMEvent) {
  const newContent = editedMEvent.getContent()['m.new_content'];
  if (typeof newContent === 'undefined') return [null, false, null];

  const isCustomHTML = newContent.format === 'org.matrix.custom.html';
  const parsedContent = parseReply(newContent.body);
  if (parsedContent === null) {
    return [newContent.body, isCustomHTML, newContent.formatted_body ?? null];
  }
  return [parsedContent.body, isCustomHTML, newContent.formatted_body ?? null];
}

function Message({
  mEvent,
  isBodyOnly,
  roomTimeline,
  focus,
  fullTime,
  isEdit,
  setEdit,
  cancelEdit,
  children,
  className,
  classNameMessage,
  timelineSVRef,
  isDM,
}) {

  // Get Room Data
  const appearanceSettings = getAppearance();
  $(timelineSVRef?.current).trigger('scroll');
  const mx = initMatrix.matrixClient;
  const roomId = mEvent.getRoomId();
  const { editedTimeline, reactionTimeline } = roomTimeline ?? {};
  const [embeds, setEmbeds] = useState([]);

  // Content Body
  const classList = ['message', isBodyOnly ? 'message--body-only' : 'message--full'];
  if (focus) classList.push('message-focus');
  const content = mEvent.getContent();
  const eventId = mEvent.getId();
  const msgType = content?.msgtype;
  const senderId = mEvent.getSender();
  const yourId = mx.getUserId();

  if (yourId === senderId) classList.push('user-you-message')
  else classList.push('user-other-message');

  let { body } = content;

  // User Data
  const fNickname = getDataList('user_cache', 'friend_nickname', senderId);

  // make the message transparent while sending and red if it failed sending
  const [messageStatus, setMessageStatus] = useState(mEvent.status);

  mEvent.once(MatrixEventEvent.Status, (e) => {
    setMessageStatus(e.status);
  });

  const username = !isDM || typeof fNickname !== 'string' || fNickname.length === 0 ? mEvent.sender ? getUsernameOfRoomMember(mEvent.sender) : getUsername(senderId) : fNickname;
  const avatarSrc = mEvent.sender?.getAvatarUrl(mx.baseUrl, 36, 36, 'crop') ?? null;
  const avatarAnimSrc = !appearanceSettings.enableAnimParams ? mEvent.sender?.getAvatarUrl(mx.baseUrl) : getAnimatedImageUrl(mEvent.sender?.getAvatarUrl(mx.baseUrl, 36, 36, 'crop')) ?? null;

  // Content Data
  let isCustomHTML = content.format === 'org.matrix.custom.html';
  let customHTML = isCustomHTML ? content.formatted_body : null;

  const bodyUrls = [];
  if (typeof body === 'string' && body.length > 0) {

    try {

      const newBodyUrls = linkify.find(
        body.replace(/\> \<\@([\S\s]+?)\> ([\S\s]+?)\n\n|\> \<\@([\S\s]+?)\> ([\S\s]+?)\\n\\n/gm, '')
          .replace(/^((?:(?:[ ]{4}|\t).*(\R|$))+)|`{3}([\w]*)\n([\S\s]+?)`{3}|`{3}([\S\s]+?)`{3}|`{2}([\S\s]+?)`{2}|`([\S\s]+?)|\[([\S\s]+?)\]|\{([\S\s]+?)\}|\<([\S\s]+?)\>|\(([\S\s]+?)\)/gm, '')
      );

      if (Array.isArray(newBodyUrls)) {
        for (const item in newBodyUrls) {
          if (tinyLinkifyFixer(newBodyUrls[item].type, newBodyUrls[item].value)) {
            bodyUrls.push(newBodyUrls[item]);
          }
        }
      }

    } catch (err) {
      console.error(err);
    }

  }

  // Edit Data
  const edit = useCallback(() => {
    if (eventId && setEdit) setEdit(eventId);
  }, [setEdit, eventId]);

  // Reply Data
  const reply = useCallback(() => {
    if (eventId && senderId) replyTo(senderId, eventId, body, customHTML);
  }, [body, customHTML, eventId, senderId]);

  if (!eventId) {
    // if the message doesn't have an id then there's nothing to do
    console.warn('Message without id', mEvent);
    return null;
  }

  if (msgType === 'm.emote') classList.push('message--type-emote');

  // Emoji Type
  const isEdited = editedTimeline ? editedTimeline.has(eventId) : false;
  const haveReactions = reactionTimeline
    ? reactionTimeline.has(eventId) || !!mEvent.getServerAggregatedRelation('m.annotation')
    : false;
  const eventRelation = mEvent.getRelation();

  // Is Reply
  const isReply =
    !!mEvent.replyEventId &&
    // don't render thread fallback replies
    !(eventRelation?.rel_type === THREAD_RELATION_TYPE.name && eventRelation?.is_falling_back)

  // Is Edit
  if (isEdited) {
    const editedList = editedTimeline.get(eventId);
    const editedMEvent = editedList[editedList.length - 1];
    [body, isCustomHTML, customHTML] = getEditedBody(editedMEvent);
  }

  // Is Reply
  if (isReply) {
    body = parseReply(body)?.body ?? body;
    customHTML = trimHTMLReply(customHTML);
  }

  // Fix Body String
  if (typeof body !== 'string') body = '';

  // Add Class Items
  if (className) {
    const tinyClasses = className.split(' ');
    for (const item in tinyClasses) {
      classList.push(tinyClasses[item]);
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {

    // Room jQuery base
    const messageFinder = `[roomid='${roomId}'][senderid='${senderId}'][eventid='${eventId}'][msgtype='${msgType}']`;

    // Read Message
    if (msgType === 'm.text') {

      // Check Urls on the message
      const appAppearance = getAppearance();
      if (appAppearance.isEmbedEnabled === true && bodyUrls.length > 0) {

        // Create embed base
        const newEmbeds = clone(embeds);
        const searchEmbeds = async () => {

          let limit = 5;
          for (const item in bodyUrls) {
            if (

              bodyUrls[item].href &&

              limit > 0 && newEmbeds.findIndex(
                tb =>
                  tb.url &&
                  tb.url.href === bodyUrls[item].href &&
                  tb.roomId === roomId &&
                  tb.senderId === senderId &&
                  tb.eventId === eventId
              ) < 0 &&

              !bodyUrls[item].href.startsWith('@')

            ) {

              const tinyEmbed = {
                url: bodyUrls[item],
                roomId,
                senderId,
                eventId,
              };

              if (bodyUrls[item].href.startsWith('http') || bodyUrls[item].href.startsWith('https')) {
                try {
                  // eslint-disable-next-line no-await-in-loop
                  tinyEmbed.data = await getUrlPreview(bodyUrls[item].href);
                } catch (err) {
                  tinyEmbed.data = null;
                  console.error(err);
                }
              } else {
                tinyEmbed.data = null;
              }

              newEmbeds.push(tinyEmbed);
              limit--;

            }
          }

          setEmbeds(newEmbeds);

        };

        searchEmbeds();

      }

    }

    // Complete
    chatboxScrollToBottom(false, null);
    return () => {
      $(messageFinder).find('.message-url-embed').remove();
    };

  }, []);

  // Normal Message
  if (msgType !== 'm.bad.encrypted') {

    // Return Data
    return <tr roomid={roomId} senderid={senderId} eventid={eventId} msgtype={msgType} className={classList.join(' ')}>

      <td className='p-0 ps-2 ps-md-4 py-1 pe-md-2 align-top text-center chat-base'>

        {
          // User Avatar
          !isBodyOnly
            ? <MessageAvatar
              roomId={roomId}
              avatarSrc={avatarSrc}
              avatarAnimSrc={avatarAnimSrc}
              userId={senderId}
              username={username}
              contextMenu={(e) => {

                openReusableContextMenu(
                  'bottom',
                  getEventCords(e, '.ic-btn'),
                  (closeMenu) => <UserOptions userId={senderId} afterOptionSelect={closeMenu} />,
                );

                e.preventDefault();

              }}
            />
            : <MessageTime
              className='hc-time'
              timestamp={mEvent.getTs()}
              fullTime={fullTime}
            />
        }

      </td>

      <td className='p-0 pe-3 py-1' colSpan={!children ? '2' : ''}>

        {roomTimeline && !isEdit && (
          <MessageOptions
            customHTML={customHTML}
            body={body}
            roomid={roomId}
            senderid={senderId}
            eventid={eventId}
            msgtype={msgType}
            roomTimeline={roomTimeline}
            mEvent={mEvent}
            edit={edit}
            reply={reply}
          />
        )}

        {!isBodyOnly && (
          <div className='mb-1'>

            <MessageHeader
              userId={senderId}
              username={username}
            />

            <MessageTime
              className='ms-2'
              timestamp={mEvent.getTs()}
              fullTime={fullTime}
            />

          </div>
        )}

        {roomTimeline && isReply && (
          <MessageReplyWrapper
            roomTimeline={roomTimeline}
            eventId={mEvent.replyEventId}
          />
        )}

        {!isEdit && (<>

          <MessageBody
            className={classNameMessage}
            senderName={username}
            isCustomHTML={isCustomHTML}
            body={isMedia(mEvent) ? genMediaContent(mEvent) : customHTML ?? body}
            content={content}
            msgType={msgType}
            isEdited={isEdited}
            messageStatus={messageStatus}
          />

          {embeds.length > 0 ? <div className='message-embed message-url-embed'>
            {embeds.map(embed => {
              if (embed.data) return <Embed embed={embed.data} />
            })}
          </div> : null}

        </>
        )}

        {isEdit && (
          <MessageEdit
            body={(customHTML
              ? html(customHTML, { kind: 'edit', onlyPlain: true }).plain
              : plain(body, { kind: 'edit', onlyPlain: true }).plain)}
            onSave={(newBody, oldBody) => {
              if (newBody !== oldBody) {
                initMatrix.roomsInput.sendEditedMessage(roomId, mEvent, newBody);
              }
              cancelEdit();
            }}
            onCancel={cancelEdit}
          />
        )}

        {haveReactions && (
          <MessageReactionGroup roomTimeline={roomTimeline} mEvent={mEvent} />
        )}

        {roomTimeline && shouldShowThreadSummary(mEvent, roomTimeline) && (
          <MessageThreadSummary thread={mEvent.thread} />
        )}

      </td>

      {children && (
        <td className='p-0 pe-3 py-1'>
          {children}
        </td>
      )}

    </tr>;

  }

  chatboxScrollToBottom();

  // Bad Message
  const errorMessage = `<i class="bi bi-key-fill text-warning"></i> <strong>Unable to decrypt message.</strong>`;
  isCustomHTML = true;
  return <tr roomid={roomId} senderid={senderId} eventid={eventId} msgtype={msgType} className={classList.join(' ')}>

    <td className='p-0 ps-2 ps-md-4 py-1 pe-md-2 align-top text-center chat-base'>

      {
        // User Avatar
        !isBodyOnly
          ? (
            <MessageAvatar
              roomId={roomId}
              avatarSrc={avatarSrc}
              userId={senderId}
              username={username}
            />
          )
          : <MessageTime
            className='hc-time'
            timestamp={mEvent.getTs()}
            fullTime={fullTime}
          />
      }

    </td>

    <td className='p-0 pe-3 py-1'>

      {roomTimeline && !isEdit && (
        <MessageOptions
          roomid={roomId}
          senderid={senderId}
          eventid={eventId}
          msgtype={msgType}
          roomTimeline={roomTimeline}
          mEvent={mEvent}
          edit={edit}
          reply={reply}
        />
      )}

      {!isBodyOnly && (
        <div className='mb-1'>

          <MessageHeader
            userId={senderId}
            username={username}
          />

          <MessageTime
            className='ms-2'
            timestamp={mEvent.getTs()}
            fullTime={fullTime}
          />

        </div>
      )}

      {roomTimeline && isReply && (
        <MessageReplyWrapper
          roomTimeline={roomTimeline}
          eventId={mEvent.replyEventId}
        />
      )}

      {!isEdit && (
        <MessageBody
          senderName={username}
          isSystem={isCustomHTML}
          body={errorMessage}
          content={content}
          msgType={msgType}
          isEdited={isEdited}
          messageStatus={messageStatus}
        />
      )}

      {isEdit && (
        <MessageEdit
          body={(customHTML
            ? html(customHTML, { kind: 'edit', onlyPlain: true }).plain
            : plain(body, { kind: 'edit', onlyPlain: true }).plain)}
          onSave={(newBody, oldBody) => {
            if (newBody !== oldBody) {
              initMatrix.roomsInput.sendEditedMessage(roomId, mEvent, newBody);
            }
            cancelEdit();
          }}
          onCancel={cancelEdit}
        />
      )}

      {haveReactions && (
        <MessageReactionGroup roomTimeline={roomTimeline} mEvent={mEvent} />
      )}

      {roomTimeline && shouldShowThreadSummary(mEvent, roomTimeline) && (
        <MessageThreadSummary thread={mEvent.thread} />
      )}

    </td>

  </tr>;

}

// Message Default Data
Message.defaultProps = {
  classNameMessage: null,
  className: null,
  isBodyOnly: false,
  focus: false,
  roomTimeline: null,
  fullTime: false,
  isEdit: false,
  setEdit: null,
  cancelEdit: null,
};

Message.propTypes = {
  classNameMessage: PropTypes.string,
  className: PropTypes.string,
  mEvent: PropTypes.shape({}).isRequired,
  isBodyOnly: PropTypes.bool,
  roomTimeline: PropTypes.shape({}),
  focus: PropTypes.bool,
  fullTime: PropTypes.bool,
  isEdit: PropTypes.bool,
  setEdit: PropTypes.func,
  cancelEdit: PropTypes.func,
};

// Send Export
export { Message, MessageReply, PlaceholderMessage };
