import React from 'react';
import PropTypes from 'prop-types';
import './Avatar.scss';

import { twemojify } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg';
import { avatarInitials } from '../../../util/common';
import { getFileContentType } from '../../../util/fileMime';

const Avatar = React.forwardRef(({
  text, bgColor, iconSrc, faSrc, iconColor, imageSrc, size, className, imgClass, imageAnimSrc
}, ref) => {
  let textSize = 's1';
  if (size === 'large') textSize = 'h1';
  if (size === 'small') textSize = 'b1';
  if (size === 'extra-small') textSize = 'b3';
  let imageLoaded = false;

  return (
    <div ref={ref} className={`avatar-container avatar-container__${size} ${className} noselect`}>
      {
        // eslint-disable-next-line no-nested-ternary
        imageSrc !== null
          ? (!imageAnimSrc ?

            <img
              className={imgClass}
              draggable="false"
              src={imageSrc}
              onLoad={(e) => { e.target.style.backgroundColor = 'transparent'; }}
              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt=""
            />

            :

            <img
              draggable="false"
              src={imageAnimSrc}
              onLoad={(e) => {
                if (!imageLoaded) {
                  imageLoaded = true;
                  getFileContentType(e, imageAnimSrc).then(data => {
                    e.target.style.backgroundColor = 'transparent';
                    if (Array.isArray(data.type) && typeof data.type[0] === 'string' && typeof data.type[1] === 'string') {
                      if (data.type[0] === 'image') {

                        if (data.type[1] === 'gif') {

                          e.target.parentNode.parentNode.parentNode.parentNode.addEventListener('mouseover', () => {
                            e.target.src = imageAnimSrc;
                          }, false);

                          e.target.parentNode.parentNode.parentNode.parentNode.addEventListener('mouseout', () => {
                            e.target.src = imageSrc;
                          }, false);

                        }

                        e.target.src = imageSrc;

                      } else { e.target.src = ImageBrokenSVG; }
                    } else { e.target.src = ImageBrokenSVG; }
                  }).catch(err => {
                    console.error(err);
                    e.target.src = ImageBrokenSVG;
                  });
                }
              }}
              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt=""
            />

          )
          : faSrc !== null
            ? (
              <span
                style={{ backgroundColor: faSrc === null ? bgColor : 'transparent' }}
                className={`avatar__border${faSrc !== null ? '--active' : ''}`}
              >
                <RawIcon size={size} fa={faSrc} color={iconColor} />
              </span>
            )

            : (
              <span
                style={{ backgroundColor: iconSrc === null ? bgColor : 'transparent' }}
                className={`avatar__border${iconSrc !== null ? '--active' : ''}`}
              >
                {
                  iconSrc !== null
                    ? <RawIcon size={size} src={iconSrc} color={iconColor} />
                    : text !== null && (
                      <Text variant={textSize} primary>
                        {twemojify(avatarInitials(text))}
                      </Text>
                    )
                }
              </span>
            )
      }
    </div>
  );
});

Avatar.defaultProps = {
  imageAnimSrc: null,
  imgClass: 'img-fluid',
  text: null,
  className: '',
  bgColor: 'transparent',
  iconSrc: null,
  faSrc: null,
  iconColor: null,
  imageSrc: null,
  size: 'normal',
};

Avatar.propTypes = {
  imageAnimSrc: PropTypes.string,
  text: PropTypes.string,
  imgClass: PropTypes.string,
  bgColor: PropTypes.string,
  className: PropTypes.string,
  iconSrc: PropTypes.string,
  faSrc: PropTypes.string,
  iconColor: PropTypes.string,
  imageSrc: PropTypes.string,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
};

export default Avatar;
