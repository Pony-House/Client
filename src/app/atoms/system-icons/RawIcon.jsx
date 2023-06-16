import React from 'react';
import PropTypes from 'prop-types';
import './RawIcon.scss';

function RawIcon({ color, size, src, isImage, fa }) {

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

    return <span className={`ic-base ic-raw ic-raw-${size}`} style={style} />;

  }

  if (color !== null) style.fontColor = color;
  return <i className={`ic-base ic-fa ic-fa-${size} ${fa}`} style={style} />;

}

RawIcon.defaultProps = {
  fa: null,
  color: null,
  size: 'normal',
  isImage: false,
};

RawIcon.propTypes = {
  fa: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
  src: PropTypes.string.isRequired,
  isImage: PropTypes.bool,
};

export default RawIcon;
