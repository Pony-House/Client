import React from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';

function Chip({ iconSrc = null, iconColor = null, text = null, children = null, onClick = null }) {
  return (
    <button className="chip" type="button" onClick={onClick}>
      {iconSrc != null && <RawIcon src={iconSrc} color={iconColor} size="extra-small" />}
      {text != null && text !== '' && <div className="very-small text-gray">{text}</div>}
      {children}
    </button>
  );
}

Chip.propTypes = {
  iconSrc: PropTypes.string,
  iconColor: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.element,
  onClick: PropTypes.func,
};

export default Chip;
