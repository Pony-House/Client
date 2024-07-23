import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '@src/client/initMatrix';

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
    // Ref
    const imgRef = ref || useRef(null);
    const url = initMatrix.mxcUrl.getNewUrl(src);

    useEffect(() => {
      if (imgRef.current) {
      }
    });

    // Complete
    return (
      <img
        onError={onError}
        onClick={onClick}
        data-mx-emoticon={dataMxEmoticon}
        draggable={draggable}
        onLoad={onLoad}
        style={style}
        id={id}
        src={url ? url.toString() : null}
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
  const url = initMatrix.mxcUrl.getNewUrl(src);

  const ops = {
    'data-mx-emoticon': dataMxEmoticon,
    id,
    class: className,
    src: url ? url.toString() : null,
    alt,
    height,
    width,
  };

  const img = $('<img>', ops);
  if (!draggable) img.attr('draggable', 'false');

  if (style) img.css(style);
  if (onLoad) img.on('load', onLoad);
  if (onClick) img.on('click', onClick);
  if (onError) img.on('error', onError);

  return img;
}

ImgJquery.propTypes = imgPropTypes;

export { ImgJquery };
