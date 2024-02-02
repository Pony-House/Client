import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPinnedMessages } from '../../../util/libs/pinMessage';

function RoomViewPin({ roomId }) {}

RoomViewPin.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomViewPin;
