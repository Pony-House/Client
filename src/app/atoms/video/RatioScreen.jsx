import React from 'react';
import PropTypes from 'prop-types';

const RatioScreen = React.forwardRef(
  (
    {
      id = null,
      className = null,
      classBase = 'video-base',
      width = 16,
      height = 9,
      children,
      style = null,
      onClick = null,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`ratio ratio-${width}x${height} ${classBase}${typeof className === 'string' ? ` ${className}` : ''}`}
        style={style}
        onClick={onClick}
      >
        {children}
      </div>
    );
  },
);

RatioScreen.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.string,
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
};

export default RatioScreen;
