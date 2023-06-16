import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './RoomViewInput.scss';

import TextareaAutosize from 'react-autosize-textarea';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import settings from '../../../client/state/settings';
import { openEmojiBoard } from '../../../client/action/navigation';
import navigation from '../../../client/state/navigation';
import { bytesToSize, getEventCords } from '../../../util/common';
import { getUsername } from '../../../util/matrixUtil';
import { colorMXID } from '../../../util/colorMXID';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import IconButton from '../../atoms/button/IconButton';
import ScrollView from '../../atoms/scroll/ScrollView';
import { MessageReply } from '../../molecules/message/Message';

import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';

import commands from './commands';

// Variables
const CMD_REGEX = /(^\/|:|@)(\S*)$/;
let isTyping = false;
let isCmdActivated = false;
let cmdCursorPos = null;

// Room View Input
function RoomViewInput({
  roomId, roomTimeline, viewEvent,
}) {

  // File
  const [attachment, setAttachment] = useState(null);

  // Reply
  const [replyTo, setReplyTo] = useState(null);

  // Inputs
  const textAreaRef = useRef(null);
  const inputBaseRef = useRef(null);
  const uploadInputRef = useRef(null);
  const uploadProgressRef = useRef(null);
  const rightOptionsRef = useRef(null);

  // Timeout Cfg
  const TYPING_TIMEOUT = 5000;

  // Matrix Client
  const mx = initMatrix.matrixClient;
  const { roomsInput } = initMatrix;

  // Request Focus
  function requestFocusInput() {
    if (textAreaRef === null) return;
    textAreaRef.current.focus();
  }

  // Effects
  useEffect(() => {
    roomsInput.on(cons.events.roomsInput.ATTACHMENT_SET, setAttachment);
    viewEvent.on('focus_msg_input', requestFocusInput);
    return () => {
      roomsInput.removeListener(cons.events.roomsInput.ATTACHMENT_SET, setAttachment);
      viewEvent.removeListener('focus_msg_input', requestFocusInput);
    };
  }, []);

  const sendIsTyping = (isT) => {
    mx.sendTyping(roomId, isT, isT ? TYPING_TIMEOUT : undefined);
    isTyping = isT;

    if (isT === true) {
      setTimeout(() => {
        if (isTyping) sendIsTyping(false);
      }, TYPING_TIMEOUT);
    }
  };

  function uploadingProgress(myRoomId, { loaded, total }) {
    if (myRoomId !== roomId) return;
    const progressPer = Math.round((loaded * 100) / total);
    uploadProgressRef.current.textContent = `Uploading: ${bytesToSize(loaded)}/${bytesToSize(total)} (${progressPer}%)`;
    inputBaseRef.current.style.backgroundImage = `linear-gradient(90deg, var(--bg-surface-hover) ${progressPer}%, var(--bg-surface-low) ${progressPer}%)`;
  }
  function clearAttachment(myRoomId) {
    if (roomId !== myRoomId) return;
    setAttachment(null);
    inputBaseRef.current.style.backgroundImage = 'unset';
    uploadInputRef.current.value = null;
  }

  function rightOptionsA11Y(A11Y) {
    const rightOptions = rightOptionsRef.current.children;
    for (let index = 0; index < rightOptions.length; index += 1) {
      rightOptions[index].tabIndex = A11Y ? 0 : -1;
    }
  }

  // CMD Stuff
  function activateCmd(prefix) {
    isCmdActivated = true;
    rightOptionsA11Y(false);
    viewEvent.emit('cmd_activate', prefix);
  }

  function deactivateCmd() {
    isCmdActivated = false;
    cmdCursorPos = null;
    rightOptionsA11Y(true);
  }

  function deactivateCmdAndEmit() {
    deactivateCmd();
    viewEvent.emit('cmd_deactivate');
  }

  function setCursorPosition(pos) {
    setTimeout(() => {
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(pos, pos);
    }, 0);
  }

  function replaceCmdWith(msg, cursor, replacement) {
    if (msg === null) return null;
    const targetInput = msg.slice(0, cursor);
    const cmdParts = targetInput.match(CMD_REGEX);
    const leadingInput = msg.slice(0, cmdParts.index);
    if (replacement.length > 0) setCursorPosition(leadingInput.length + replacement.length);
    return leadingInput + replacement + msg.slice(cursor);
  }

  function firedCmd(cmdData) {

    const msg = textAreaRef.current.value;
    textAreaRef.current.value = replaceCmdWith(
      msg,
      cmdCursorPos,
      typeof cmdData?.replace !== 'undefined' ? cmdData.replace : '',
    );

    deactivateCmd();

  }

  // Input
  function focusInput() {
    if (settings.isTouchScreenDevice) return;
    textAreaRef.current.focus();
  }

  // Set Reply
  function setUpReply(userId, eventId, body, formattedBody) {

    setReplyTo({ userId, eventId, body });

    roomsInput.setReplyTo(roomId, {
      userId, eventId, body, formattedBody,
    });

    focusInput();

  }

  // Effects
  useEffect(() => {

    // Events On
    roomsInput.on(cons.events.roomsInput.UPLOAD_PROGRESS_CHANGES, uploadingProgress);
    roomsInput.on(cons.events.roomsInput.ATTACHMENT_CANCELED, clearAttachment);
    roomsInput.on(cons.events.roomsInput.FILE_UPLOADED, clearAttachment);

    viewEvent.on('cmd_fired', firedCmd);

    navigation.on(cons.events.navigation.REPLY_TO_CLICKED, setUpReply);

    // Textarea
    if (textAreaRef?.current !== null) {
      isTyping = false;
      textAreaRef.current.value = roomsInput.getMessage(roomId);
      setAttachment(roomsInput.getAttachment(roomId));
      setReplyTo(roomsInput.getReplyTo(roomId));
    }

    // Complete
    return () => {

      roomsInput.removeListener(cons.events.roomsInput.UPLOAD_PROGRESS_CHANGES, uploadingProgress);
      roomsInput.removeListener(cons.events.roomsInput.ATTACHMENT_CANCELED, clearAttachment);
      roomsInput.removeListener(cons.events.roomsInput.FILE_UPLOADED, clearAttachment);

      viewEvent.removeListener('cmd_fired', firedCmd);
      navigation.removeListener(cons.events.navigation.REPLY_TO_CLICKED, setUpReply);

      if (isCmdActivated) deactivateCmd();
      if (textAreaRef?.current === null) return;

      const msg = textAreaRef.current.value;

      textAreaRef.current.style.height = 'unset';
      inputBaseRef.current.style.backgroundImage = 'unset';

      if (msg.trim() === '') {
        roomsInput.setMessage(roomId, '');
        return;
      }
      roomsInput.setMessage(roomId, msg);

    };

  }, [roomId]);

  // Send Body
  const sendBody = async (body, options) => {

    // Options
    const opt = options ?? {};

    // Is Text
    if (!opt.msgType) opt.msgType = 'm.text';

    // Markdown
    if (typeof opt.autoMarkdown !== 'boolean') opt.autoMarkdown = true;

    // Is Seding?
    if (roomsInput.isSending(roomId)) return;

    // Cancel Typing Warn
    sendIsTyping(false);

    // Set Message
    roomsInput.setMessage(roomId, body);

    // Prepare Files
    if (attachment !== null) {
      roomsInput.setAttachment(roomId, attachment);
    }


    // Prepare Message
    textAreaRef.current.disabled = true;
    textAreaRef.current.style.cursor = 'not-allowed';

    // Send Input
    await roomsInput.sendInput(roomId, opt).catch(err => {
      alert(err.message);
    });

    // CSS
    textAreaRef.current.disabled = false;
    textAreaRef.current.style.cursor = 'unset';
    focusInput();

    // Get Room ID
    textAreaRef.current.value = roomsInput.getMessage(roomId);
    textAreaRef.current.style.height = 'unset';

    // Reply Fix
    if (replyTo !== null) setReplyTo(null);

  };

  // Command
  const processCommand = (cmdBody) => {

    const spaceIndex = cmdBody.indexOf(' ');
    const cmdName = cmdBody.slice(1, spaceIndex > -1 ? spaceIndex : undefined);
    const cmdData = spaceIndex > -1 ? cmdBody.slice(spaceIndex + 1) : '';

    if (!commands[cmdName]) {
      confirmDialog('Invalid Command', `"${cmdName}" is not a valid command.`, 'Alright');
      return;
    }

    if (['me', 'shrug', 'plain'].includes(cmdName)) {
      commands[cmdName].exe(roomId, cmdData, sendBody);
      return;
    }

    commands[cmdName].exe(roomId, cmdData);

  };

  // Send Message
  const sendMessage = async () => {

    // Animation
    requestAnimationFrame(() => deactivateCmdAndEmit());

    // Message Body
    const msgBody = textAreaRef.current.value.trim();
    if (msgBody.startsWith('/')) {
      processCommand(msgBody.trim());
      textAreaRef.current.value = '';
      textAreaRef.current.style.height = 'unset';
      return;
    }

    // Send Body
    if (msgBody === '' && attachment === null) return;
    sendBody(msgBody);

  };

  // Sticker
  const handleSendSticker = async (data) => {
    roomsInput.sendSticker(roomId, data);
  };

  // Typing Progress
  function processTyping(msg) {

    const isEmptyMsg = msg === '';

    if (isEmptyMsg && isTyping) {
      sendIsTyping(false);
      return;
    }

    if (!isEmptyMsg && !isTyping) {
      sendIsTyping(true);
    }

  }

  // Get Cursor
  function getCursorPosition() {
    return textAreaRef.current.selectionStart;
  }

  // Cmd
  function recognizeCmd(rawInput) {

    const cursor = getCursorPosition();
    const targetInput = rawInput.slice(0, cursor);

    const cmdParts = targetInput.match(CMD_REGEX);
    if (cmdParts === null) {
      if (isCmdActivated) deactivateCmdAndEmit();
      return;
    }

    const cmdPrefix = cmdParts[1];
    const cmdSlug = cmdParts[2];

    if (cmdPrefix === ':') {
      // skip emoji autofill command if link is suspected.
      const checkForLink = targetInput.slice(0, cmdParts.index);
      if (checkForLink.match(/(http|https|mailto|matrix|ircs|irc)$/)) {
        deactivateCmdAndEmit();
        return;
      }
    }

    cmdCursorPos = cursor;
    if (cmdSlug === '') {
      activateCmd(cmdPrefix);
      return;
    }

    if (!isCmdActivated) activateCmd(cmdPrefix);
    viewEvent.emit('cmd_process', cmdPrefix, cmdSlug);

  }

  // Msg Typing
  const handleMsgTyping = (e) => {
    const msg = e.target.value;
    recognizeCmd(e.target.value);
    if (!isCmdActivated) processTyping(msg);
  };

  // Keydown
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      roomsInput.cancelReplyTo(roomId);
      setReplyTo(null);
    }
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle Paste
  const handlePaste = (e) => {
    if (e.clipboardData === false) {
      return;
    }

    if (e.clipboardData.items === undefined) {
      return;
    }

    for (let i = 0; i < e.clipboardData.items.length; i += 1) {
      const item = e.clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const image = item.getAsFile();
        if (attachment === null) {
          setAttachment(image);
          if (image !== null) {
            roomsInput.setAttachment(roomId, image);
            return;
          }
        } else {
          return;
        }
      }
    }
  };

  // Add Emoji
  function addEmoji(emoji) {
    textAreaRef.current.value += emoji.unicode;
    textAreaRef.current.focus();
  }

  const handleUploadClick = () => {
    if (attachment === null) uploadInputRef.current.click();
    else {
      roomsInput.cancelAttachment(roomId);
    }
  };
  function uploadFileChange(e) {
    const file = e.target.files.item(0);
    setAttachment(file);
    if (file !== null) roomsInput.setAttachment(roomId, file);
  }

  // Render Inputs
  function renderInputs() {

    // Check Perm
    const canISend = roomTimeline.room.currentState.maySendMessage(mx.getUserId());
    const tombstoneEvent = roomTimeline.room.currentState.getStateEvents('m.room.tombstone')[0];

    // Nope
    if (!canISend || tombstoneEvent) {
      return (
        <Text className="room-input__alert">
          {
            tombstoneEvent
              ? tombstoneEvent.getContent()?.body ?? 'This room has been replaced and is no longer active.'
              : 'You do not have permission to post to this room'
          }
        </Text>
      );
    }

    // Complete
    return (
      <>

        <div className={`room-input__option-container${attachment === null ? '' : ' room-attachment__option'}`}>
          <input onChange={uploadFileChange} style={{ display: 'none' }} ref={uploadInputRef} type="file" />
          <IconButton onClick={handleUploadClick} tooltip={attachment === null ? 'Upload' : 'Cancel'} fa="fa-solid fa-circle-plus" />
        </div>

        <div ref={inputBaseRef} className="room-input__input-container">
          {roomTimeline.isEncrypted() && <RawIcon size="extra-small" fa="bi bi-shield-lock-fill" />}
          <ScrollView autoHide>
            <Text className="room-input__textarea-wrapper">
              <TextareaAutosize
                dir="auto"
                id="message-textarea"
                ref={textAreaRef}
                onChange={handleMsgTyping}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
              />
            </Text>
          </ScrollView>
        </div>

        <div ref={rightOptionsRef} className="room-input__option-container">

          <IconButton
            onClick={(e) => {

              const cords = getEventCords(e);
              cords.x -= (document.dir === 'rtl' ? -80 : 280);
              cords.y -= 460;

              cords.y += 220;

              openEmojiBoard(cords, 'sticker', data => {

                handleSendSticker({
                  body: data.unicode.substring(1, data.unicode.length - 1),
                  httpUrl: initMatrix.matrixClient.mxcUrlToHttp(data.mxc),
                  mxc: data.mxc
                });

                e.target.click();

              });

            }}
            tooltip="Sticker"
            fa="fa-solid fa-note-sticky"
          />

          <IconButton
            onClick={(e) => {

              const cords = getEventCords(e);
              cords.x -= (document.dir === 'rtl' ? -80 : 280);
              cords.y -= 460;

              if (window.matchMedia('screen and (max-width: 479px)').matches) {
                cords.x -= 50;
              }

              cords.y += 220;

              openEmojiBoard(cords, 'emoji', emoji => {

                addEmoji(emoji);
                e.target.click();

              });

            }}
            tooltip="Emoji"
            fa="fa-solid fa-face-smile"
          />

          <IconButton onClick={sendMessage} tooltip="Send" fa="fa-solid fa-paper-plane" />

        </div>

      </>
    );
  }

  // Insert File
  function attachFile() {
    const fileType = attachment.type.slice(0, attachment.type.indexOf('/'));
    return (
      <div className="room-attachment">
        <div className={`room-attachment__preview${fileType !== 'image' ? ' room-attachment__icon' : ''}`}>
          {fileType === 'image' && <img alt={attachment.name} src={URL.createObjectURL(attachment)} />}
          {fileType === 'video' && <RawIcon fa="fa-solid fa-film" />}
          {fileType === 'audio' && <RawIcon fa="fa-solid fa-volume-high" />}
          {fileType !== 'image' && fileType !== 'video' && fileType !== 'audio' && <RawIcon fa="fa-solid fa-file" />}
        </div>
        <div className="room-attachment__info">
          <Text variant="b1">{attachment.name}</Text>
          <div className="very-small text-gray"><span ref={uploadProgressRef}>{`size: ${bytesToSize(attachment.size)}`}</span></div>
        </div>
      </div>
    );
  }

  // File Reply
  function attachReply() {
    return (
      <div className="room-reply">
        <IconButton
          onClick={() => {
            roomsInput.cancelReplyTo(roomId);
            setReplyTo(null);
          }}
          fa="fa-solid fa-xmark"
          tooltip="Cancel reply"
          size="extra-small"
        />
        <MessageReply
          userId={replyTo.userId}
          onKeyDown={handleKeyDown}
          name={getUsername(replyTo.userId)}
          color={colorMXID(replyTo.userId)}
          body={replyTo.body}
        />
      </div>
    );
  }

  // Complete
  return (
    <>
      {replyTo !== null && attachReply()}
      {attachment !== null && attachFile()}
      <form className="room-input" onSubmit={(e) => { e.preventDefault(); }}>
        {
          renderInputs()
        }
      </form>
    </>
  );

}
// ================================ End Script

// Room View PropTypes
RoomViewInput.propTypes = {
  roomId: PropTypes.string.isRequired,
  roomTimeline: PropTypes.shape({}).isRequired,
  viewEvent: PropTypes.shape({}).isRequired,
};

export default RoomViewInput;
