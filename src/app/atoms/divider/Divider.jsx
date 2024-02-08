import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { markAsRead } from '../../../client/action/notifications';

import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function Divider({ text, variant, className, clickRemove, roomId, thread }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    isVisible && (
      <tr>
        <td colSpan="2">
          <center className={`divider-box very-small border-bottom border-${variant}`}>
            {text !== null && (
              <div
                className={`text-bg badge bg-${variant}${className ? ` ${className}` : ''} rounded-0 border-bottom border-${variant}${clickRemove ? ' divider-box-click' : ''}`}
                onClick={() => {
                  if (clickRemove) {
                    setIsVisible(false);
                    markAsRead(roomId, thread ? thread.id : null);
                  }
                }}
              >
                {text}
              </div>
            )}
          </center>
        </td>
      </tr>
    )
  );
}

Divider.defaultProps = {
  text: null,
  roomId: null,
  clickRemove: false,
  variant: 'link btn-bg',
};

Divider.propTypes = {
  clickRemove: PropTypes.bool,
  roomId: PropTypes.string,
  text: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(bsColorsArray),
};

export default Divider;
