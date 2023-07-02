import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { twemojify } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg';
import { avatarInitials } from '../../../util/common';
import { getFileContentType } from '../../../util/fileMime';

const Avatar = React.forwardRef(({
  text, bgColor, iconSrc, faSrc, iconColor, imageSrc, size, className, imgClass, imageAnimSrc, isDefaultImage, animParentsCount
}, ref) => {

  // Prepare Data
  let textSize = 's1';
  if (size === 'large') textSize = 'h1';
  if (size === 'small') textSize = 'b1';
  if (size === 'extra-small') textSize = 'b3';
  let imageLoaded = false;

  // Colors
  let colorCode = Number(bgColor.substring(0, bgColor.length - 1).replace('var(--mx-uc-', ''));
  if (typeof colorCode !== 'number' || Number.isNaN(colorCode) || !Number.isFinite(colorCode) || colorCode < 1) {
    colorCode = 1;
  }

  // Render
  return (
    <div ref={ref} className={`avatar-container avatar-container__${size} ${className} noselect`}>
      {

        // Exist Image
        // eslint-disable-next-line no-nested-ternary
        imageSrc !== null || isDefaultImage

          // Image
          ? (!imageAnimSrc ?

            // Default Image
            <img
              className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
              draggable="false"
              src={imageSrc !== null ? imageSrc : `./public/img/default_avatar/${colorCode}.jpg`}
              onLoad={(e) => { e.target.style.backgroundColor = 'transparent'; }}
              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt=""
            />

            :

            // Custom Image
            <img

              className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
              draggable="false"
              animsrc={imageAnimSrc}
              normalsrc={imageSrc}
              src={imageAnimSrc !== null ? imageAnimSrc : `./public/img/default_avatar/${colorCode}.jpg`}
              onLoad={(e) => {
                if (!imageLoaded) {

                  // Prepare Data
                  const img = $(e.target);
                  imageLoaded = true;
                  getFileContentType(e, imageAnimSrc).then(data => {

                    // Set background e prepare data validator
                    img.css('background-color', 'transparent');
                    if (Array.isArray(data.type) && typeof data.type[0] === 'string' && typeof data.type[1] === 'string') {
                      if (data.type[0] === 'image') {

                        // Gif Detected
                        if (data.type[1] === 'gif') {

                          // Prepare Node Detector
                          let tinyNode = e.target;
                          for (let i = 0; i < animParentsCount; i++) {
                            tinyNode = tinyNode.parentNode;
                          }

                          // Final Node
                          tinyNode = $(tinyNode);

                          // Insert Effects
                          tinyNode.hover(
                            () => {
                              img.attr('src', imageAnimSrc);
                            }, () => {
                              img.attr('src', imageSrc);
                            }
                          );

                        }

                        // Set Normal Image
                        img.attr('src', imageSrc);

                        // Invalid values here
                      } else { img.attr('src', ImageBrokenSVG); }
                    } else { img.attr('src', ImageBrokenSVG); }

                  }).catch(err => {
                    console.error(err);
                    img.attr('src', ImageBrokenSVG);
                  });
                }
              }}

              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt='avatar'

            />

          )

          // Icons
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

// Props
Avatar.defaultProps = {
  animParentsCount: 4,
  isDefaultImage: false,
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
  animParentsCount: PropTypes.number,
  isDefaultImage: PropTypes.bool,
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
