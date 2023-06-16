import React from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';
import Tooltip from '../tooltip/Tooltip';
import Text from '../text/Text';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

const IconButton = React.forwardRef(({
  variant, size, type, fa,
  tooltip, tooltipPlacement, src,
  onClick, tabIndex, disabled, isImage,
  className, customColor,
  style
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
      style={style}
      ref={ref}
      className={`btn ic-btn ic-btn-${variant} btn-link btn-bg ${textColor} ${className}`}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      <RawIcon fa={fa} size={size} src={src} isImage={isImage} />
    </button>
  );

  if (tooltip === null) return btn;

  return (
    <Tooltip
      placement={tooltipPlacement}
      content={<Text variant="b2">{tooltip}</Text>}
    >
      {btn}
    </Tooltip>
  );

});

IconButton.defaultProps = {
  customColor: null,
  variant: 'link btn-bg',
  size: 'normal',
  type: 'button',
  tooltip: null,
  tooltipPlacement: 'top',
  onClick: null,
  fa: null,
  tabIndex: 0,
  disabled: false,
  isImage: false,
  className: '',
};

IconButton.propTypes = {
  style: PropTypes.object,
  customColor: PropTypes.string,
  variant: PropTypes.oneOf(bsColorsArray),
  size: PropTypes.oneOf(['normal', 'small', 'extra-small']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  src: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  isImage: PropTypes.bool,
  className: PropTypes.string,
  fa: PropTypes.string,
};

export default IconButton;
