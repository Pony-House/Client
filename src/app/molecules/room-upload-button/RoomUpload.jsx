import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';

function RoomUpload({ roomId, afterOptionSelect, handleUploadClick }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const uplaodButton = () => {
    handleUploadClick(roomId);
    afterOptionSelect();
  };

  return (
    <div className="noselect emoji-size-fix w-100" style={{ maxWidth: '256px' }}>
      <MenuHeader>{twemojifyReact(`Message options for ${room?.name}`)}</MenuHeader>
      <MenuItem className="text-start" faSrc="bi bi-file-earmark-plus-fill" onClick={uplaodButton}>
        Upload a file
        <br />
        <span className="very-small">
          Tip: Double click the
          <i className="ms-1 fa-solid fa-circle-plus" />
        </span>
      </MenuItem>
    </div>
  );
}

RoomUpload.defaultProps = {
  afterOptionSelect: null,
};

RoomUpload.propTypes = {
  roomId: PropTypes.string.isRequired,
  afterOptionSelect: PropTypes.func,
  handleUploadClick: PropTypes.func,
};

export default RoomUpload;
