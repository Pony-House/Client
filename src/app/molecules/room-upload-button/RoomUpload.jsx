import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem } from '../../atoms/context-menu/ContextMenu';

function RoomUpload({ roomId, afterOptionSelect, handleUploadClick }) {
  const uplaodButton = () => {
    handleUploadClick(roomId);
    afterOptionSelect();
  };

  return (
    <div className="noselect emoji-size-fix w-100" style={{ maxWidth: '256px' }}>
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
