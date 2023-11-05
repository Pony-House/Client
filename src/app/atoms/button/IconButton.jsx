import React from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';
import Tooltip from '../tooltip/Tooltip';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

const IconButton = React.forwardRef(({
  variant, size, type, fa,
  tooltip, tooltipPlacement, src,
  onClick, tabIndex, disabled, isImage,
  className, customColor,
  style, children, id
}, ref) => {

  let textColor = variant;
  if (typeof customColor === 'string') {
    if (customColor !== 'null') {
      textColor = customColor;
    } else {
      textColor = '';
    }
  }

  if (textColor) {
    textColor = `btn-text-${textColor}`;
  }

  const btn = (
    <button
      id={id}
      style={style}
      ref={ref}
      className={`btn ic-btn ic-btn-${variant} btn-link btn-bg ${textColor} ${className}`}
      onClick={onClick}
      type={type}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      <RawIcon fa={fa} size={size} src={src} isImage={isImage} />
      {children}
    </button>
  );

  if (typeof tooltip === 'undefined') return btn;

  return (
    <Tooltip
      placement={tooltipPlacement}
      content={<small>{tooltip}</small>}
    >
      {btn}
    </Tooltip>
  );

});

IconButton.defaultProps = {
  id: null,
  customColor: null,
  variant: 'link btn-bg',
  size: 'normal',
  type: 'button',
  tooltipPlacement: 'top',
  onClick: null,
  fa: null,
  tabIndex: 0,
  disabled: false,
  isImage: false,
  className: '',
  children: null,
};

IconButton.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
  customColor: PropTypes.string,
  variant: PropTypes.oneOf(bsColorsArray),
  size: PropTypes.oneOf(['normal', 'small', 'extra-small']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  tooltipPlacement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  src: PropTypes.string,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  isImage: PropTypes.bool,
  className: PropTypes.string,
  fa: PropTypes.string,
};

export default IconButton;
