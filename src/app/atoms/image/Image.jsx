import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Image = React.forwardRef(
  (
    {
      style = null,
      height = null,
      width = null,
      src = null,
      alt = null,
      className = null,
      id = null,
    },
    ref,
  ) => {
    const imgRef = ref || useRef(null);
    const url = new URL(src);

    useEffect(() => {
      if (imgRef.current) {
      }
    });

    return (
      <img
        style={style}
        id={id}
        src={src}
        alt={alt}
        ref={imgRef}
        className={className}
        height={height}
        width={width}
      />
    );
  },
);

Image.propTypes = {
  style: PropTypes.object,
  height: PropTypes.number,
  width: PropTypes.number,
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Image;
