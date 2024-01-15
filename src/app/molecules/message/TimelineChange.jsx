import React from 'react';
import PropTypes from 'prop-types';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Time from '../../atoms/time/Time';

function TimelineChange({
  variant, content, timestamp, onClick,
}) {
  let faSrc;

  switch (variant) {
    case 'join':
      faSrc = "fa-solid fa-arrow-right-to-bracket";
      break;
    case 'leave':
      faSrc = "fa-solid fa-arrow-right-from-bracket";
      break;
    case 'invite':
      faSrc = "fa-solid fa-user-plus";
      break;
    case 'invite-cancel':
      faSrc = "fa-solid fa-user-minus";
      break;
    case 'pinned-events-added':
      faSrc = "bi bi-pin-angle-fill";
      break;
    case 'pinned-events-removed':
      faSrc = "bi bi-pin-angle";
      break;
    case 'avatar':
      faSrc = "fa-solid fa-id-badge";
      break;
    default:
      faSrc = "fa-solid fa-arrow-right-to-bracket";
      break;
  }

  return (
    <tr onClick={onClick} style={{ cursor: onClick === null ? 'default' : 'pointer' }} className="emoji-size-fix chat-status">

      <td className='p-0 ps-2 ps-md-4 py-1 pe-md-2 align-top text-center chat-base'>
        <RawIcon fa={faSrc} size="extra-small" />
      </td>

      <td className='p-0 pe-3 py-1'>
        <div className="very-small">
          {content} <Time timestamp={timestamp} className='ms-2' />
        </div>
      </td>

    </tr>
  );
}

TimelineChange.defaultProps = {
  variant: 'other',
  onClick: null,
};

TimelineChange.propTypes = {
  variant: PropTypes.oneOf([
    'join', 'leave', 'invite',
    'invite-cancel', 'avatar', 'other',
    'pinned-events-added', 'pinned-events-removed', 'pinned-events',
  ]),
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  timestamp: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default TimelineChange;
