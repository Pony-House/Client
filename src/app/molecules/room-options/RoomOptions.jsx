import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { openInviteUser } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';
import { markAsRead } from '../../../client/action/notifications';

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import RoomNotification from '../room-notification/RoomNotification';

import { confirmDialog } from '../confirm-dialog/ConfirmDialog';
import { openPinMessageModal } from '../../../util/libs/pinMessage';

function RoomOptions({ roomId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const canInvite = room?.canInvite(mx.getUserId());

  const handleMarkAsRead = () => {
    markAsRead(roomId);
    afterOptionSelect();
  };

  const handleInviteClick = () => {
    openInviteUser(roomId);
    afterOptionSelect();
  };
  const handleLeaveClick = async () => {
    afterOptionSelect();
    const isConfirmed = await confirmDialog(
      'Leave room',
      `Are you sure that you want to leave "${room.name}" room?`,
      'Leave',
      'danger',
    );
    if (!isConfirmed) return;
    roomActions.leave(roomId);
  };

  return (
    <div className="noselect emoji-size-fix w-100" style={{ maxWidth: '256px' }}>
      <MenuHeader>
        {twemojifyReact(`Options for ${initMatrix.matrixClient.getRoom(roomId)?.name}`)}
      </MenuHeader>
      <MenuItem className="text-start" faSrc="fa-solid fa-check-double" onClick={handleMarkAsRead}>
        Mark as read
      </MenuItem>
      <MenuItem
        className="text-start"
        faSrc="fa-solid fa-user-plus"
        onClick={handleInviteClick}
        disabled={!canInvite}
      >
        Invite
      </MenuItem>
      {mx.isRoomEncrypted(roomId) === false ? (
        <MenuItem
          className="text-start d-sm-none"
          faSrc="bi bi-pin-angle-fill"
          onClick={() => {
            afterOptionSelect();
            openPinMessageModal(room);
          }}
        >
          Pinned Messages
        </MenuItem>
      ) : null}
      <MenuItem
        className="text-start btn-text-danger"
        faSrc="fa-solid fa-arrow-right-from-bracket"
        onClick={handleLeaveClick}
      >
        Leave
      </MenuItem>
      <MenuHeader>Notification</MenuHeader>
      <RoomNotification roomId={roomId} />
    </div>
  );
}

RoomOptions.defaultProps = {
  afterOptionSelect: null,
};

RoomOptions.propTypes = {
  roomId: PropTypes.string.isRequired,
  afterOptionSelect: PropTypes.func,
};

export default RoomOptions;
