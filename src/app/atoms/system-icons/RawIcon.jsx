import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AvatarJquery } from '../avatar/Avatar';

function RawIcon({
  neonColor = false,
  color = null,
  size = 'normal',
  src = null,
  srcAnim = null,
  isImage = false,
  fa = null,
  className = null,
}) {
  const iconRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageAnimSrc, setImageAnimSrc] = useState(null);

  useEffect(() => {
    if (!fa && src) {
      if (!src.startsWith('./')) {
        const iconData = AvatarJquery({
          isObj: true,
          imageSrc: src,
          imageAnimSrc: srcAnim,
          onLoadingChange: () => {
            if (typeof iconData.blobSrc === 'string' && iconData.blobSrc.length > 0) {
              setImageSrc(iconData.blobSrc);
            }
          },
        });

        if (iconRef.current && imageAnimSrc) {
          const icon = $(iconRef.current);
          const iconStyleChangerIn = () => {
            icon.css('background-image', `url("${imageAnimSrc}")`);
          };

          const iconStyleChangerOut = () => {
            icon.css('background-image', `url("${imageSrc}")`);
          };

          icon.on('mouseover', iconStyleChangerIn);
          icon.on('mouseout', iconStyleChangerOut);
          return () => {
            icon.off('mouseover', iconStyleChangerIn);
            icon.off('mouseout', iconStyleChangerOut);
          };
        }
      } else {
        setImageSrc(src);
      }
    }
  });

  const style = {};
  if (!fa) {
    if (color !== null) style.backgroundColor = color;
    if (isImage) {
      style.backgroundColor = 'transparent';
      if (imageSrc) style.backgroundImage = `url("${!imageAnimSrc ? imageSrc : imageAnimSrc}")`;
    } else if (imageSrc) {
      style.WebkitMaskImage = `url("${!imageAnimSrc ? imageSrc : imageAnimSrc}")`;
      style.maskImage = `url("${!imageAnimSrc ? imageSrc : imageAnimSrc}")`;
    }

    return (
      <span
        ref={iconRef}
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
  srcAnim: PropTypes.string,
  isImage: PropTypes.bool,
};

export default RawIcon;
