import React from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';
import { blurOnBubbling } from './script';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

const Button = React.forwardRef(
  ({ id, className, variant, iconSrc, faSrc, type, onClick, children, disabled, size }, ref) => {
    const iconClass = iconSrc === null ? '' : `btn-${variant}--icon`;

    return (
      <button
        ref={ref}
        id={id === '' ? undefined : id}
        className={`btn ${className ? `${className} ` : ''}btn-${variant} btn-${size} ${iconClass} noselect`}
        onMouseUp={(e) => blurOnBubbling(e, `.btn-${variant}`)}
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {iconSrc !== null && <RawIcon size="small" className="me-2" src={iconSrc} />}
        {faSrc !== null && <RawIcon size="small" className="me-2" fa={faSrc} />}
        {children}
      </button>
    );
  },
);

Button.defaultProps = {
  id: '',
  size: 'sm',
  className: null,
  variant: 'link btn-bg',
  iconSrc: null,
  faSrc: null,
  type: 'button',
  onClick: null,
  disabled: false,
};

Button.propTypes = {
  id: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(bsColorsArray),
  iconSrc: PropTypes.string,
  faSrc: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};

export default Button;
