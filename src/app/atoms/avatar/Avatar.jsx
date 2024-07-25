import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Freezeframe from 'freezeframe';

import blobUrlManager from '@src/util/libs/blobUrlManager';
import initMatrix from '@src/client/initMatrix';
import { getFileContentType } from '@src/util/fileMime';

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

// getFileContentType

const Avatar = React.forwardRef(
  (
    {
      onClick = null,
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
    const mxcUrl = initMatrix.mxcUrl;

    // Freeze Avatar
    const freezeAvatarRef = useRef(null);
    const imgRef = ref || useRef(null);

    // imageAnimSrc
    // imageSrc
    // appearanceSettings.isAnimateAvatarsEnabled
    // appearanceSettings.useFreezePlugin
    const [imgSrc, setImgSrc] = useState(null);
    const [imgAnimSrc, setImgAnimSrc] = useState(null);

    const [imgError, setImgError] = useState(null);
    const [imgAnimError, setImgAnimError] = useState(null);

    const [blobSrc, setBlobSrc] = useState(null);
    const [blobAnimSrc, setBlobAnimSrc] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    // Avatar Config
    const appearanceSettings = getAppearance();

    // Prepare Data
    let textSize = 's1';
    if (size === 'large') textSize = 'h1';
    if (size === 'small') textSize = 'b1';
    if (size === 'extra-small') textSize = 'b3';

    // Get data
    const defaultAvatar = avatarDefaultColor(bgColor);
    useEffect(() => {
      if (typeof imageSrc === 'string') {
        if (!isLoading) {
          // Complete checker
          let isLoadingProgress = 0;
          const isComplete = () => {
            if (isLoading && isLoadingProgress < 1) {
              setIsLoading(false);
            }
          };

          // Active load progress
          const progressLoad = (tnSrc, tinySrc, setTinyBlob, setTnSrc, setError, isAnim) => {
            // Enable loading mode
            setIsLoading(true);
            setError(null);

            // The new image is string
            if (typeof tinySrc === 'string') {
              // Exist blob cache?
              const blobFromId = blobUrlManager.getById(tinySrc);
              if (blobFromId) {
                setTinyBlob(blobFromId);
                setTnSrc(tinySrc);
              }

              // Nope. Let's create a new one.
              else {
                // Reset image data
                setTnSrc(null);
                setTinyBlob(null);

                // Is normal image? Reset the animation version too.
                if (!isAnim) {
                  setBlobAnimSrc(null);
                  setImgAnimSrc(null);
                  setImgAnimError(null);
                }

                // Add loading progress...
                isLoadingProgress++;
                mxcUrl
                  .focusFetchBlob(tinySrc)
                  .then((blobFromFetch) =>
                    blobUrlManager.insert(blobFromFetch, {
                      freeze: true,
                      group: `user_avatars`,
                    }),
                  )
                  // Complete
                  .then((blobUrl) => {
                    // Insert data
                    setTinyBlob(blobUrl);
                    setTnSrc(tinySrc);

                    // Check the progress
                    isLoadingProgress--;
                    isComplete();
                  })
                  // Error
                  .catch((err) => {
                    // Show console error
                    console.error(err);

                    // Check the progress
                    isLoadingProgress--;
                    isComplete();
                  });
              }
            }
            // Nothing
            else {
              setTnSrc(null);
              setTinyBlob(null);
            }
          };

          // Execute the image loading

          // Normal image
          progressLoad(imgSrc, imageSrc, setBlobSrc, setImgSrc, setImgError, false);

          // Anim image
          progressLoad(imgAnimSrc, imageAnimSrc, setBlobAnimSrc, setImgAnimSrc, setImgError, true);

          // Check the progress
          isComplete();

          /* 
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
                  
                },
                () => {
                  
                },
              );
    
              if (typeof avatar.render === 'function') avatar.render();
              return () => {
                if (avatar && typeof avatar.destroy === 'function') avatar.destroy();
              };
            }
          }*/
        }
      }
    });

    // Image
    const tinyImg = () =>
      !isLoading && (
        <img
          ref={theRef}
          className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
          draggable="false"
          src={blobSrc}
          onError={(e) => {
            setBlobSrc(ImageBrokenSVG);
            setBlobAnimSrc(ImageBrokenSVG);
          }}
          alt={text || 'avatar'}
        />
      );

    // Icons
    const tinyIcon = () =>
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
      );

    // Render
    const isImage = imageSrc !== null || isDefaultImage;
    return (
      <div
        onClick={onClick}
        ref={imgRef}
        className={`avatar-container${`${className ? ` ${className}` : ''}`} noselect${isImage && !isLoading ? '' : ' image-react-loaded'}`}
      >
        {isImage ? tinyImg() : tinyIcon()}
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
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
};

export default Avatar;
