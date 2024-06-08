import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Freezeframe from 'freezeframe';
import { readImageUrl } from '@src/util/libs/mediaCache';

import { loadAvatar, forceLoadAvatars } from './load';
import { twemojifyReact } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import { defaultAvatar, defaultProfileBanner, defaultSpaceBanner } from './defaultAvatar';
import { getAppearance } from '../../../util/libs/appearance';

const ImageBrokenSVG = './img/svg/image-broken.svg';

const defaultGetItems = {
  avatar: (colorCode) => defaultAvatar(colorCode),
  space: (colorCode) => defaultSpaceBanner(colorCode),
  profile: (colorCode) => defaultProfileBanner(colorCode),
};

export const avatarDefaultColor = (bgColor, type = 'avatar') => {
  // Colors
  let colorCode = Number(bgColor.substring(0, bgColor.length - 1).replace('var(--mx-uc-', ''));
  if (
    typeof colorCode !== 'number' ||
    Number.isNaN(colorCode) ||
    !Number.isFinite(colorCode) ||
    colorCode < 1
  ) {
    colorCode = 1;
  }

  // Default Avatar
  if (typeof defaultGetItems[type] === 'function') return defaultGetItems[type](colorCode);
  return null;
};

const Avatar = React.forwardRef(
  (
    {
      neonColor = false,
      text = null,
      bgColor = 'transparent',
      iconSrc = null,
      faSrc = null,
      iconColor = null,
      imageSrc = null,
      size = 'normal',
      className = '',
      imgClass = 'img-fluid',
      imageAnimSrc = null,
      isDefaultImage = false,
      animParentsCount = 4,
      theRef,
    },
    ref,
  ) => {
    // Freeze Avatar
    const freezeAvatarRef = useRef(null);
    const ref2 = useRef(null);

    // Avatar Config
    const appearanceSettings = getAppearance();

    // Prepare Data
    let textSize = 's1';
    if (size === 'large') textSize = 'h1';
    if (size === 'small') textSize = 'b1';
    if (size === 'extra-small') textSize = 'b3';

    const tinyDa = avatarDefaultColor(bgColor);
    setTimeout(forceLoadAvatars, 100);
    useEffect(() => {
      forceLoadAvatars();
      if (freezeAvatarRef.current) {
        const avatar = new Freezeframe(freezeAvatarRef.current, {
          responsive: true,
          trigger: false,
          overlay: false,
        });

        const img = $(avatar.$images[0]);
        const loadingimg = img.attr('loadingimg');
        if (loadingimg !== 'true' && loadingimg !== true) {
          img.attr('loadingimg', 'true');
          let tinyNode = avatar.$images[0];
          for (let i = 0; i < animParentsCount + 1; i++) {
            tinyNode = tinyNode.parentNode;
          }

          // Final Node
          tinyNode = $(tinyNode);

          // Insert Effects
          tinyNode.hover(
            () => {
              if (typeof avatar.start === 'function') avatar.start();
            },
            () => {
              if (typeof avatar.stop === 'function') avatar.stop();
            },
          );

          if (typeof avatar.render === 'function') avatar.render();
          return () => {
            if (avatar && typeof avatar.destroy === 'function') avatar.destroy();
          };
        }
      }
    }, []);

    const onLoadAvatar = () => {
      if (ref) {
        if (ref.current) ref.current.classList.add('avatar-react-loaded');
      } else if (ref2.current) ref2.current.classList.add('avatar-react-loaded');
    };

    const isImage = imageSrc !== null || isDefaultImage;

    // Render
    return (
      <div
        ref={ref || ref2}
        className={`avatar-container avatar-container__${size} ${className} noselect${isImage ? '' : ' avatar-react-loaded'}`}
      >
        {
          // Exist Image
          isImage ? (
            // Image
            !imageAnimSrc || !appearanceSettings.isAnimateAvatarsEnabled ? (
              // Default Image
              <img
                ref={theRef}
                className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
                draggable="false"
                src={
                  typeof imageSrc === 'string' && imageSrc.length > 0
                    ? readImageUrl(imageSrc)
                    : tinyDa
                }
                onLoad={onLoadAvatar}
                onError={(e) => {
                  e.target.src = ImageBrokenSVG;
                }}
                alt={text || 'avatar'}
              />
            ) : appearanceSettings.useFreezePlugin ? (
              // Custom Image
              <div className="react-freezeframe">
                <img
                  ref={freezeAvatarRef}
                  className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
                  onLoad={onLoadAvatar}
                  src={
                    typeof imageAnimSrc === 'string' && imageAnimSrc.length > 0
                      ? readImageUrl(imageAnimSrc)
                      : tinyDa
                  }
                  alt={text || 'avatar'}
                />
              </div>
            ) : (
              <img
                className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
                draggable="false"
                loadedimg="false"
                loadingimg="false"
                animparentscount={animParentsCount}
                animsrc={imageAnimSrc}
                normalsrc={imageSrc}
                defaultavatar={tinyDa}
                src={readImageUrl(tinyDa)}
                onLoad={(e) => {
                  onLoadAvatar(e);
                  loadAvatar(e);
                }}
                onError={(e) => {
                  e.target.src = ImageBrokenSVG;
                }}
                alt={text || 'avatar'}
              />
            )
          ) : // Icons
          faSrc !== null ? (
            <span
              style={{ backgroundColor: faSrc === null ? bgColor : 'transparent' }}
              className={`avatar__border${faSrc !== null ? '--active' : ''}`}
            >
              <RawIcon size={size} fa={faSrc} neonColor={neonColor} color={iconColor} />
            </span>
          ) : (
            <span
              style={{ backgroundColor: iconSrc === null ? bgColor : 'transparent' }}
              className={`avatar__border${iconSrc !== null ? '--active' : ''}`}
            >
              {iconSrc !== null ? (
                <RawIcon size={size} src={iconSrc} neonColor={neonColor} color={iconColor} />
              ) : (
                text !== null && (
                  <Text variant={textSize} primary>
                    {twemojifyReact(true, avatarInitials(text))}
                  </Text>
                )
              )}
            </span>
          )
        }
      </div>
    );
  },
);

// Props
Avatar.propTypes = {
  neonColor: PropTypes.bool,
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
