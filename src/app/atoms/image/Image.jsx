import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Img = React.forwardRef(
  (
    {
      draggable = false,
      style = null,
      height = null,
      width = null,
      src = null,
      alt = null,
      className = null,
      id = null,
      onLoad = null,
      onClick = null,
      onError = null,
      dataMxEmoticon = null,
    },
    ref,
  ) => {
    const imgRef = ref || useRef(null);
    let url = {};
    try {
      url = new URL(src);
    } catch {
      url = {};
    }

    useEffect(() => {
      if (imgRef.current) {
      }
    });

    return (
      <img
        onError={onError}
        onClick={onClick}
        data-mx-emoticon={dataMxEmoticon}
        draggable={draggable}
        onLoad={onLoad}
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

const imgPropTypes = {
  dataMxEmoticon: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  draggable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  onLoad: PropTypes.func,
  onClick: PropTypes.func,
  onError: PropTypes.func,
};
Img.propTypes = imgPropTypes;

export default Img;

function ImgJquery({
  draggable = false,
  style = null,
  height = null,
  width = null,
  src = null,
  alt = null,
  className = null,
  id = null,
  onLoad = null,
  onClick = null,
  onError = null,
  dataMxEmoticon = null,
}) {
  let url = {};
  try {
    url = new URL(src);
  } catch {
    url = {};
  }

  const img = $('<img>', {
    'data-mx-emoticon': dataMxEmoticon,
    id,
    class: className,
    draggable,
    src,
    alt,
    height,
    width,
  });

  if (style) img.css(style);
  if (onLoad) img.on('load', onLoad);
  if (onClick) img.on('click', onClick);
  if (onError) img.on('error', onError);

  return img;
}

ImgJquery.propTypes = imgPropTypes;

export { ImgJquery };
