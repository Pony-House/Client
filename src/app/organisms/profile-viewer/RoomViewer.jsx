import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { defaultAvatar } from '@src/app/atoms/avatar/defaultAvatar';
import { twemojifyReact } from '../../../util/twemojify';

import imageViewer from '../../../util/imageViewer';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { selectRoom, selectRoomMode } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';

import { hasDMWith, hasDevices } from '../../../util/matrixUtil';
import { colorMXID } from '../../../util/colorMXID';

import Avatar, { avatarDefaultColor } from '../../atoms/avatar/Avatar';
import Button from '../../atoms/button/Button';
import Dialog from '../../molecules/dialog/Dialog';

import copyText from './copyText';
import tinyAPI from '../../../util/mods';

function RoomFooter({ roomId, onRequestClose }) {
  const [isCreatingDM, setIsCreatingDM] = useState(false);

  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const onCreated = (dmRoomId) => {
    setIsCreatingDM(false);
    selectRoomMode('room');
    selectRoom(dmRoomId);
    onRequestClose();
  };

  useEffect(() => {
    const { roomList } = initMatrix;
    roomList.on(cons.events.roomList.ROOM_CREATED, onCreated);
    return () => {
      roomList.removeListener(cons.events.roomList.ROOM_CREATED, onCreated);
    };
  }, []);

  const openDM = async () => {
    // Check and open if room already have a DM with roomId.
    const dmRoomId = hasDMWith(roomId);
    if (dmRoomId) {
      selectRoomMode('room');
      selectRoom(dmRoomId);
      onRequestClose();
      return;
    }

    // Create new DM
    try {
      setIsCreatingDM(true);
      await roomActions.createDM(roomId, await hasDevices(roomId));
    } catch {
      setIsCreatingDM(false);
    }
  };

  // disabled={isCreatingDM}

  return (
    <>
      <Button className="me-2" variant="primary" onClick={openDM} disabled>
        {isCreatingDM ? 'Creating room...' : 'Message'}
      </Button>
    </>
  );
}
RoomFooter.propTypes = {
  roomId: PropTypes.string.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

function useToggleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [originalRoomId, setOriginalRoomId] = useState(null);

  useEffect(() => {
    const loadRoom = (rId, oId) => {
      setIsOpen(true);
      setRoomId(rId);
      setOriginalRoomId(oId);
    };
    navigation.on(cons.events.navigation.ROOM_VIEWER_OPENED, loadRoom);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_VIEWER_OPENED, loadRoom);
    };
  }, []);

  const closeDialog = () => setIsOpen(false);

  const afterClose = () => {
    setRoomId(null);
    setOriginalRoomId(null);
  };

  return [isOpen, originalRoomId, roomId, closeDialog, afterClose];
}

// Read Profile
function RoomViewer() {
  // Prepare
  const profileAvatar = useRef(null);

  const [isOpen, originalRoomId, roomId, closeDialog, handleAfterClose] = useToggleDialog();
  const [lightbox, setLightbox] = useState(false);

  const userNameRef = useRef(null);
  const displayNameRef = useRef(null);

  // Get Data
  const mx = initMatrix.matrixClient;

  const room = mx.getRoom(roomId);
  const isSpace = room ? room.isSpaceRoom() : null;

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState(null);

  console.log(room, roomId, originalRoomId, avatarUrl, username);

  useEffect(() => {
    if (room) {
      const theAvatar = room.getAvatarUrl(initMatrix.matrixClient.baseUrl);
      const newAvatar = theAvatar ? theAvatar : avatarDefaultColor(colorMXID(roomId));

      setAvatarUrl(newAvatar);
      setUsername(room.name || roomId);

      // Avatar Preview
      const tinyAvatarPreview = () => {
        if (newAvatar) {
          imageViewer({
            lightbox,
            imgQuery: $(profileAvatar.current).find('> img'),
            name: username,
            url: newAvatar,
            readMime: true,
          });
        }
      };

      // Copy Profile Username
      const copyUsername = {
        tag: (event) => copyText(event, 'Username successfully copied to the clipboard.'),
        display: (event) => copyText(event, 'Display name successfully copied to the clipboard.'),
      };

      // Read Events
      $(displayNameRef.current).find('> .button').on('click', copyUsername.display);
      $(userNameRef.current).find('> .button').on('click', copyUsername.tag);
      $(profileAvatar.current).on('click', tinyAvatarPreview);

      return () => {
        $(displayNameRef.current).find('> .button').off('click', copyUsername.display);
        $(userNameRef.current).find('> .button').off('click', copyUsername.tag);
        $(profileAvatar.current).off('click', tinyAvatarPreview);
      };
    } else if (!roomId) {
      setAvatarUrl(defaultAvatar(0));
      setUsername(null);
    }
  }, [room]);

  // Render Profile
  const renderProfile = () => {
    const toggleLightbox = () => {
      if (!avatarUrl) return;
      setLightbox(!lightbox);
    };

    return (
      <>
        <div className="p-4">
          <div className="row pb-3">
            <div
              className="col-lg-3 text-center d-flex justify-content-center modal-user-profile-avatar"
              onClick={toggleLightbox}
              onKeyDown={toggleLightbox}
            >
              <Avatar
                ref={profileAvatar}
                imageSrc={avatarUrl}
                text={username}
                bgColor={colorMXID(roomId)}
                size="large"
                isDefaultImage
              />
            </div>

            <div className="col-md-9 buttons-list">
              <div className="float-end">
                <RoomFooter roomId={roomId} onRequestClose={closeDialog} />
              </div>
            </div>
          </div>

          <div className="card bg-bg">
            <div className="card-body">
              <h6 ref={displayNameRef} className="emoji-size-fix m-0 mb-1 fw-bold display-name">
                <span className="button">{twemojifyReact(username)}</span>
              </h6>
              <small ref={userNameRef} className="text-gray emoji-size-fix username">
                <span className="button">{twemojifyReact(originalRoomId)}</span>
              </small>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Read Modal
  return (
    <Dialog
      bodyClass="bg-bg2 p-0"
      className="modal-dialog-scrollable modal-dialog-centered modal-lg noselect modal-dialog-user-profile modal-dialog-room-profile"
      isOpen={isOpen}
      title="Room Profile"
      onAfterClose={handleAfterClose}
      onRequestClose={closeDialog}
    >
      {roomId ? renderProfile() : <div />}
    </Dialog>
  );
}

export default RoomViewer;
