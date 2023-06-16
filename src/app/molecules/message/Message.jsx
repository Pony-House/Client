import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import './Message.scss';

import { twemojify } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import {
  getUsername, getUsernameOfRoomMember, parseReply, trimHTMLReply,
} from '../../../util/matrixUtil';
import { colorMXID } from '../../../util/colorMXID';
import { getEventCords } from '../../../util/common';
import { redactEvent, sendReaction } from '../../../client/action/roomTimeline';
import {
  openEmojiBoard, openProfileViewer, openReadReceipts, openViewSource, replyTo,
} from '../../../client/action/navigation';
import { sanitizeCustomHtml } from '../../../util/sanitize';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Button from '../../atoms/button/Button';
import Tooltip from '../../atoms/tooltip/Tooltip';
import Input from '../../atoms/input/Input';
import Avatar from '../../atoms/avatar/Avatar';
import IconButton from '../../atoms/button/IconButton';
import Time from '../../atoms/time/Time';
import ContextMenu, { MenuHeader, MenuItem, MenuBorder } from '../../atoms/context-menu/ContextMenu';
import * as Media from '../media/Media';

import { confirmDialog } from '../confirm-dialog/ConfirmDialog';
import { getBlobSafeMimeType } from '../../../util/mimetypes';
import { html, plain } from '../../../util/markdown';

function PlaceholderMessage() {
  return (
    <tr className="ph-msg">
      <td colSpan="2">
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
        <p className="placeholder-glow"><span className="placeholder col-12" /></p>
      </td>
    </tr>
  );
}

// Avatar Generator
const MessageAvatar = React.memo(({
  roomId, avatarSrc, avatarAnimSrc, userId, username,
}) => (
  <button type="button" onClick={() => openProfileViewer(userId, roomId)}>
    <Avatar imgClass='' imageAnimSrc={avatarAnimSrc} imageSrc={avatarSrc} text={username} bgColor={colorMXID(userId)} />
  </button>
));

// Message Header
const MessageHeader = React.memo(({
  userId, username,
}) => (
  <span className='username-base emoji-size-fix' style={{ color: colorMXID(userId) }}>
    <span className='username'>{twemojify(username)}</span>
    <span className='user-id'>{twemojify(userId)}</span>
  </span>
));

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
  return (
    <div className="pb-2 emoji-size-fix small text-reply">
      <RawIcon color={color} size="normal" fa="fa-solid fa-reply" />
      {' '}
      <span className="username-title emoji-size-fix" style={{ color }}>{twemojify(name)}</span>
      {' '}
      {twemojify(body)}
    </div>
  );
}

MessageReply.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

const MessageReplyWrapper = React.memo(({ roomTimeline, eventId }) => {
  const [reply, setReply] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const mx = initMatrix.matrixClient;
    const timelineSet = roomTimeline.getUnfilteredTimelineSet();
    const loadReply = async () => {
      try {
        const eTimeline = await mx.getEventTimeline(timelineSet, eventId);
        await roomTimeline.decryptAllEventsOfTimeline(eTimeline);

        let mEvent = eTimeline.getTimelineSet().findEventById(eventId);
        const editedList = roomTimeline.editedTimeline.get(mEvent.getId());
        if (editedList) {
          mEvent = editedList[editedList.length - 1];
        }

        const rawBody = mEvent.getContent().body;
        const username = getUsernameOfRoomMember(mEvent.sender);

        if (isMountedRef.current === false) return;
        const fallbackBody = mEvent.isRedacted() ? '*** This message has been deleted ***' : '*** Unable to load reply ***';
        let parsedBody = parseReply(rawBody)?.body ?? rawBody ?? fallbackBody;
        if (editedList && parsedBody.startsWith(' * ')) {
          parsedBody = parsedBody.slice(3);
        }

        setReply({
          to: username,
          color: colorMXID(mEvent.getSender()),
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
  }, []);

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
      tabIndex="0"
    >
      {reply !== null && <MessageReply name={reply.to} color={reply.color} body={reply.body} />}
    </div>
  );
});
MessageReplyWrapper.propTypes = {
  roomTimeline: PropTypes.shape({}).isRequired,
  eventId: PropTypes.string.isRequired,
};

// Message Body
const MessageBody = React.memo(({
  className,
  senderName,
  body,
  isCustomHTML,
  isSystem,
  isEdited,
  msgType,
}) => {
  // if body is not string it is a React element.
  if (typeof body !== 'string') return <div className="message__body">{body}</div>;

  let content = null;
  if (isCustomHTML) {
    try {
      content = twemojify(
        sanitizeCustomHtml(initMatrix.matrixClient, body),
        undefined,
        true,
        false,
        true,
      );
    } catch {
      console.error('Malformed custom html: ', body);
      content = twemojify(body, undefined);
    }
  } else if (!isSystem) {
    content = twemojify(body, undefined, true);
  } else {
    content = twemojify(body, undefined, true, false, true);
  }

  // Determine if this message should render with large emojis
  // Criteria:
  // - Contains only emoji
  // - Contains no more than 10 emoji
  let emojiOnly = false;
  if (content.type === 'img') {
    // If this messages contains only a single (inline) image
    emojiOnly = true;
  } else if (content.constructor.name === 'Array') {
    // Otherwise, it might be an array of images / texb

    // Count the number of emojis
    const nEmojis = content.filter((e) => e.type === 'img').length;

    // Make sure there's no text besides whitespace and variation selector U+FE0F
    if (nEmojis <= 10 && content.every((element) => (
      (typeof element === 'object' && element.type === 'img')
      || (typeof element === 'string' && /^[\s\ufe0f]*$/g.test(element))
    ))) {
      emojiOnly = true;
    }
  }

  if (!isCustomHTML) {
    // If this is a plaintext message, wrap it in a <p> element (automatically applying
    // white-space: pre-wrap) in order to preserve newlines
    content = (<p className="m-0">{content}</p>);
  }

  return (
    <div className={`text-freedom message-body small text-bg${!emojiOnly ? ' emoji-size-fix' : ''} ${className}`}>
      {msgType === 'm.emote' && (
        <>
          {'* '}
          {twemojify(senderName)}
          {' '}
        </>
      )}
      {content}
      {isEdited && <div className="very-small text-gray">(edited)</div>}
    </div>
  );
});
MessageBody.defaultProps = {
  className: '',
  isCustomHTML: false,
  isSystem: false,
  isEdited: false,
  msgType: null,
};
MessageBody.propTypes = {
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
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }

    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      onSave(editInputRef.current.value, body);
    }
  };

  return (
    <form className="message__edit" onSubmit={(e) => { e.preventDefault(); onSave(editInputRef.current.value, body); }}>
      <div>
        <Input
          forwardRef={editInputRef}
          onKeyDown={handleKeyDown}
          value={body}
          placeholder="Edit message"
          required
          resizable
          autoFocus
        />
      </div>
      <div className="message__edit-btns">
        <Button type="submit" variant="primary">Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
MessageEdit.propTypes = {
  body: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Get Emoji
function getMyEmojiEvent(emojiKey, eventId, roomTimeline) {
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

function toggleEmoji(roomId, eventId, emojiKey, shortcode, roomTimeline) {
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
function pickEmoji(e, roomId, eventId, roomTimeline, extraX = 0, extraX2 = 0) {

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
  openEmojiBoard(cords, 'emoji', (emoji) => {
    toggleEmoji(roomId, eventId, emoji.mxc ?? emoji.unicode, emoji.shortcodes[0], roomTimeline);
    e.target.click();
  });

}

// Reaction Generator
function genReactionMsg(userIds, reaction, shortcode) {
  return (
    <>
      {userIds.map((userId, index) => (
        <React.Fragment key={userId}>
          {twemojify(getUsername(userId))}
          {index < userIds.length - 1 && (
            <span style={{ opacity: '.6' }}>
              {index === userIds.length - 2 ? ' and ' : ', '}
            </span>
          )}
        </React.Fragment>
      ))}
      <span style={{ opacity: '.6' }}>{' reacted with '}</span>
      {twemojify(shortcode ? `:${shortcode}:` : reaction, { className: 'react-emoji' })}
    </>
  );
}

// Reaction Manager
function MessageReaction({
  reaction, shortcode, count, users, isActive, onClick,
}) {
  let customEmojiUrl = null;
  if (reaction.match(/^mxc:\/\/\S+$/)) {
    customEmojiUrl = initMatrix.matrixClient.mxcUrlToHttp(reaction);
  }
  return (
    <Tooltip
      className="msg__reaction-tooltip"
      content={<Text variant="b2">{users.length > 0 ? genReactionMsg(users, reaction, shortcode) : 'Unable to load who has reacted'}</Text>}
    >
      <button
        onClick={onClick}
        type="button"
        className={`msg__reaction${isActive ? ' msg__reaction--active' : ''}`}
      >
        {
          customEmojiUrl
            ? <img className="react-emoji" draggable="false" alt={shortcode ?? reaction} src={customEmojiUrl} />
            : twemojify(reaction, { className: 'react-emoji' })
        }
        <div className="very-small text-gray msg__reaction-count">{count}</div>
      </button>
    </Tooltip>
  );
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
  const canSendReaction = room.currentState.maySendEvent('m.reaction', mx.getUserId());

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

// Message Options
const MessageOptions = React.memo(({
  roomTimeline, mEvent, edit, reply,
}) => {
  const { roomId, room } = roomTimeline;
  const mx = initMatrix.matrixClient;
  const senderId = mEvent.getSender();

  const myPowerlevel = room.getMember(mx.getUserId())?.powerLevel;
  const canIRedact = room.currentState.hasSufficientPowerLevelFor('redact', myPowerlevel);
  const canSendReaction = room.currentState.maySendEvent('m.reaction', mx.getUserId());

  return (
    <div className="message__options">
      {canSendReaction && (
        <IconButton
          onClick={(e) => pickEmoji(e, roomId, mEvent.getId(), roomTimeline)}
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
      {(senderId === mx.getUserId() && !isMedia(mEvent)) && (
        <IconButton
          onClick={() => edit(true)}
          fa="fa-solid fa-pencil"
          size="normal"
          tooltip="Edit"
        />
      )}
      <ContextMenu
        content={() => (
          <>
            <MenuHeader>Options</MenuHeader>
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
});

// Options Default
MessageOptions.propTypes = {
  roomTimeline: PropTypes.shape({}).isRequired,
  mEvent: PropTypes.shape({}).isRequired,
  edit: PropTypes.func.isRequired,
  reply: PropTypes.func.isRequired,
};

// Media Generator
function genMediaContent(mE) {

  // Client
  const mx = initMatrix.matrixClient;
  const mContent = mE.getContent();

  // Bad Event
  if (!mContent || !mContent.body) return <span style={{ color: 'var(--bg-danger)' }}>Malformed event</span>;

  // Content URL
  let mediaMXC = mContent?.url;
  const isEncryptedFile = typeof mediaMXC === 'undefined';
  if (isEncryptedFile) mediaMXC = mContent?.file?.url;

  // Thumbnail
  let thumbnailMXC = mContent?.info?.thumbnail_url;

  // Bad Event Again
  if (typeof mediaMXC === 'undefined' || mediaMXC === '') return <span style={{ color: 'var(--bg-danger)' }}>Malformed event</span>;

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

  // Blurhash
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
          width={typeof mContent.info?.w === 'number' ? mContent.info?.w : null}
          height={typeof mContent.info?.h === 'number' ? mContent.info?.h : null}
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

// Get Edit Body
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

// Message Base Receive
function Message({
  mEvent, isBodyOnly, roomTimeline,
  focus, fullTime, isEdit, setEdit, cancelEdit,
}) {

  // Get Room Data
  const roomId = mEvent.getRoomId();
  const { editedTimeline, reactionTimeline } = roomTimeline ?? {};

  // Content Body
  const className = [];
  if (focus) className.push('message-focus');
  const content = mEvent.getContent();
  const eventId = mEvent.getId();
  const msgType = content?.msgtype;
  const senderId = mEvent.getSender();

  let { body } = content;

  // console.log(content);

  // User Data
  const username = mEvent.sender ? getUsernameOfRoomMember(mEvent.sender) : getUsername(senderId);
  const avatarSrc = mEvent.sender?.getAvatarUrl(initMatrix.matrixClient.baseUrl, 36, 36, 'crop') ?? null;
  const avatarAnimSrc = mEvent.sender?.getAvatarUrl(initMatrix.matrixClient.baseUrl) ?? null;

  // Content Data
  let isCustomHTML = content.format === 'org.matrix.custom.html';
  let customHTML = isCustomHTML ? content.formatted_body : null;

  // Edit Data
  const edit = useCallback(() => {
    setEdit(eventId);
  }, []);

  // Reply Data
  const reply = useCallback(() => {
    replyTo(senderId, mEvent.getId(), body, customHTML);
  }, [body, customHTML]);

  // Emoji Type
  if (msgType === 'm.emote') className.push('message--type-emote');

  // Is Edit
  const isEdited = roomTimeline ? editedTimeline.has(eventId) : false;

  // Get Reactions
  const haveReactions = roomTimeline
    ? reactionTimeline.has(eventId) || !!mEvent.getServerAggregatedRelation('m.annotation')
    : false;

  // Is Reply
  const isReply = !!mEvent.replyEventId;

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

  // Normal Message
  if (msgType !== 'm.bad.encrypted') {

    // Return Data
    return (
      <tr className={className.join(' ')}>

        <td className='p-0 ps-4 py-1 pe-2 align-top text-center chat-base'>

          {
            // User Avatar
            !isBodyOnly
              ? (
                <MessageAvatar
                  roomId={roomId}
                  avatarSrc={avatarSrc}
                  avatarAnimSrc={avatarAnimSrc}
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
              isCustomHTML={isCustomHTML}
              body={isMedia(mEvent) ? genMediaContent(mEvent) : customHTML ?? body}
              msgType={msgType}
              isEdited={isEdited}
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

        </td>

      </tr>
    );

  }

  // Bad Message
  const errorMessage = `<i class="bi bi-key-fill text-warning"></i> <strong>Unable to decrypt message.</strong>`;
  isCustomHTML = true;
  return (
    <tr className={className.join(' ')}>

      <td className='p-0 ps-4 py-1 pe-2 align-top text-center chat-base'>

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
            msgType={msgType}
            isEdited={isEdited}
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

      </td>

    </tr>
  );

}

// Message Default Data
Message.defaultProps = {
  isBodyOnly: false,
  focus: false,
  roomTimeline: null,
  fullTime: false,
  isEdit: false,
  setEdit: null,
  cancelEdit: null,
};

Message.propTypes = {
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
