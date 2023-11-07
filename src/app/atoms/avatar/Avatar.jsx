import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { loadAvatar, forceLoadAvatars } from './load';
import { twemojifyReact } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import defaultAvatar from './defaultAvatar';
import { getAppearance } from '../../../util/libs/appearance';

const ImageBrokenSVG = './img/svg/image-broken.svg';

const Avatar = React.forwardRef(({
  text, bgColor, iconSrc, faSrc, iconColor, imageSrc, size, className, imgClass, imageAnimSrc, isDefaultImage, animParentsCount, theRef,
}, ref) => {

  // Avatar Config
  const appearanceSettings = getAppearance();

  // Prepare Data
  let textSize = 's1';
  if (size === 'large') textSize = 'h1';
  if (size === 'small') textSize = 'b1';
  if (size === 'extra-small') textSize = 'b3';

  // Colors
  let colorCode = Number(bgColor.substring(0, bgColor.length - 1).replace('var(--mx-uc-', ''));
  if (typeof colorCode !== 'number' || Number.isNaN(colorCode) || !Number.isFinite(colorCode) || colorCode < 1) {
    colorCode = 1;
  }

  // Default Avatar
  const tinyDa = defaultAvatar(colorCode);
  setTimeout(forceLoadAvatars, 100);
  useEffect(() => { forceLoadAvatars(); }, []);

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
              ref={theRef}
              className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
              draggable="false"
              src={imageSrc !== null ? imageSrc : defaultAvatar(colorCode)}
              onLoad={(e) => { e.target.style.backgroundColor = 'transparent'; }}
              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt={text || 'avatar'}
            />

            :

            // Custom Image
            <img

              className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}

              draggable='false'
              loadedimg={appearanceSettings.isAnimateAvatarsEnabled ? 'false' : null}
              loadingimg={appearanceSettings.isAnimateAvatarsEnabled ? 'false' : null}

              animparentscount={appearanceSettings.isAnimateAvatarsEnabled ? animParentsCount : null}

              animsrc={appearanceSettings.isAnimateAvatarsEnabled ? imageAnimSrc : null}
              normalsrc={appearanceSettings.isAnimateAvatarsEnabled ? imageSrc : null}
              defaultavatar={appearanceSettings.isAnimateAvatarsEnabled ? tinyDa : null}

              src={appearanceSettings.isAnimateAvatarsEnabled ? tinyDa : imageSrc}

              onLoad={appearanceSettings.isAnimateAvatarsEnabled ? loadAvatar : null}

              onError={(e) => { e.target.src = ImageBrokenSVG; }}
              alt={text || 'avatar'}

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
                        {twemojifyReact(true, avatarInitials(text))}
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
