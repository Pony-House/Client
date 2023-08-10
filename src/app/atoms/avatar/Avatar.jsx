import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { loadAvatar, forceLoadAvatars } from './load';
import { twemojifyReact } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import defaultAvatar from './defaultAvatar';

const ImageBrokenSVG = './img/svg/image-broken.svg';

const Avatar = React.forwardRef(({
  text, bgColor, iconSrc, faSrc, iconColor, imageSrc, size, className, imgClass, imageAnimSrc, isDefaultImage, animParentsCount, theRef,
}, ref) => {

  // Avatar Config
  let appearanceSettings = {};

  if (initMatrix.matrixClient && initMatrix.matrixClient.getAccountData) {
    appearanceSettings = initMatrix.matrixClient.getAccountData('pony.house.appearance')?.getContent() ?? {};
  }

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
              loadedimg={appearanceSettings.isAnimateAvatarsHidden !== true ? 'false' : null}
              loadingimg={appearanceSettings.isAnimateAvatarsHidden !== true ? 'false' : null}

              animparentscount={appearanceSettings.isAnimateAvatarsHidden !== true ? animParentsCount : null}

              animsrc={appearanceSettings.isAnimateAvatarsHidden !== true ? imageAnimSrc : null}
              normalsrc={appearanceSettings.isAnimateAvatarsHidden !== true ? imageSrc : null}
              defaultavatar={appearanceSettings.isAnimateAvatarsHidden !== true ? tinyDa : null}

              src={appearanceSettings.isAnimateAvatarsHidden !== true ? tinyDa : imageSrc}

              onLoad={appearanceSettings.isAnimateAvatarsHidden !== true ? loadAvatar : null}

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
