import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';
import Tooltip from '../tooltip/Tooltip';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

const IconButton = React.forwardRef(
  (
    {
      variant = 'link btn-bg',
      size = 'normal',
      type = 'button',
      fa = null,
      tooltip,
      tooltipPlacement = 'top',
      src,
      onClick = null,
      onDblClick = null,
      tabIndex = 0,
      disabled = false,
      isImage = false,
      className = '',
      customColor = null,
      style,
      children = null,
      id = null,
    },
    ref,
  ) => {
    const button = useRef(null);
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

    useEffect(() => {
      if (typeof onDblClick === 'function') {
        const buttonClick = $(button.current);
        buttonClick.on('dblclick', onDblClick);
        return () => {
          buttonClick.off('dblclick', onDblClick);
        };
      }
    });

    const btn = (
      <button
        id={id}
        style={style}
        ref={typeof onDblClick !== 'function' ? ref : button}
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
      <Tooltip placement={tooltipPlacement} content={<small>{tooltip}</small>}>
        {btn}
      </Tooltip>
    );
  },
);

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
  onDblClick: PropTypes.func,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  isImage: PropTypes.bool,
  className: PropTypes.string,
  fa: PropTypes.string,
};

export default IconButton;
