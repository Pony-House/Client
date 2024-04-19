import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Freezeframe from 'freezeframe';
import { readImageUrl } from '@src/util/libs/mediaCache';

import { loadAvatar, forceLoadAvatars } from './load';
import { twemojifyReact } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import defaultAvatar from './defaultAvatar';
import { getAppearance } from '../../../util/libs/appearance';

const ImageBrokenSVG = './img/svg/image-broken.svg';

const Avatar = React.forwardRef(
  (
    {
      text,
      bgColor,
      iconSrc,
      faSrc,
      iconColor,
      imageSrc,
      size,
      className,
      imgClass,
      imageAnimSrc,
      isDefaultImage,
      animParentsCount,
      theRef,
    },
    ref,
  ) => {
    // Freeze Avatar
    const freezeAvatarRef = useRef(null);

    // Avatar Config
    const appearanceSettings = getAppearance();

    // Prepare Data
    let textSize = 's1';
    if (size === 'large') textSize = 'h1';
    if (size === 'small') textSize = 'b1';
    if (size === 'extra-small') textSize = 'b3';

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
    const tinyDa = defaultAvatar(colorCode);
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

    // Render
    return (
      <div ref={ref} className={`avatar-container avatar-container__${size} ${className} noselect`}>
        {
          // Exist Image
          // eslint-disable-next-line no-nested-ternary
          imageSrc !== null || isDefaultImage ? (
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
                onLoad={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
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
                onLoad={loadAvatar}
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
              <RawIcon size={size} fa={faSrc} color={iconColor} />
            </span>
          ) : (
            <span
              style={{ backgroundColor: iconSrc === null ? bgColor : 'transparent' }}
              className={`avatar__border${iconSrc !== null ? '--active' : ''}`}
            >
              {iconSrc !== null ? (
                <RawIcon size={size} src={iconSrc} color={iconColor} />
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
