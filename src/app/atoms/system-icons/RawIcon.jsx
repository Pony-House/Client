import React from 'react';
import PropTypes from 'prop-types';

function RawIcon({
  neonColor = false,
  color = null,
  size = 'normal',
  src,
  isImage = false,
  fa = null,
  className = null,
}) {
  const style = {};
  if (!fa) {
    if (color !== null) style.backgroundColor = color;
    if (isImage) {
      style.backgroundColor = 'transparent';
      style.backgroundImage = `url("${src}")`;
    } else {
      style.WebkitMaskImage = `url("${src}")`;
      style.maskImage = `url("${src}")`;
    }

    return (
      <span
        className={`ic-base ic-raw ic-raw-${size}${className ? ` ${className}` : ''}`}
        style={style}
      />
    );
  }

  if (color !== null) {
    style.color = color;
    if (neonColor) {
      /*
          0 0 7px #fff,
    0 0 10px #fff,
    0 0 21px #fff,
    0 0 42px #0fa,
    0 0 82px #0fa,
    0 0 92px #0fa,
    0 0 102px #0fa,
    0 0 151px #0fa;
    */
      style.textShadow = `0 0 1px ${color},
      0 0 21px ${color},
      0 0 41px ${color},
      0 0 46px ${color},
      0 0 51px ${color},
      0 0 75px ${color}`;
    }
  }
  return (
    <i
      className={`ic-base ic-fa ic-fa-${size} ${fa}${className ? ` ${className}` : ''}`}
      style={style}
    />
  );
}

RawIcon.propTypes = {
  neonColor: PropTypes.bool,
  className: PropTypes.string,
  fa: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
  src: PropTypes.string,
  isImage: PropTypes.bool,
};

export default RawIcon;
