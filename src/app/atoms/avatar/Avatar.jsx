import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import blobUrlManager from '@src/util/libs/blobUrlManager';
import initMatrix from '@src/client/initMatrix';
import { getFileContentType } from '@src/util/fileMime';

import { twemojifyReact } from '../../../util/twemojify';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import { defaultAvatar, defaultProfileBanner, defaultSpaceBanner } from './defaultAvatar';
import { getAppearance } from '../../../util/libs/appearance';
import { imageExts } from '@src/util/MimesUtil';

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
      animParentsCount = 3,
      theRef,
    },
    ref,
  ) => {
    const mxcUrl = initMatrix.mxcUrl;

    // Freeze Avatar
    const freezeAvatarRef = useRef(null);
    const imgRef = ref || useRef(null);

    // Get Url
    let tinyImageUrl = imageSrc;
    let tinyImageAnimUrl = imageAnimSrc;
    if (isDefaultImage) {
      const defaultAvatar = avatarDefaultColor(bgColor);
      if (typeof tinyImageUrl !== 'string' || tinyImageUrl.length < 1) tinyImageUrl = defaultAvatar;
    }

    // Prepare data
    const [waitSrc, setWaitSrc] = useState(tinyImageUrl);

    const [imgMime, setImgMime] = useState([]);
    const [imgMimeAnim, setImgMimeAnim] = useState([]);

    const [imgSrc, setImgSrc] = useState(null);
    const [imgAnimSrc, setImgAnimSrc] = useState(null);

    const [imgError, setImgError] = useState(null);
    const [imgAnimError, setImgAnimError] = useState(null);

    const [blobSrc, setBlobSrc] = useState(null);
    const [blobAnimSrc, setBlobAnimSrc] = useState(null);

    const [isLoading, setIsLoading] = useState(0);
    const [useAnimation, setUseAnimation] = useState(false);

    // Avatar Config
    const appearanceSettings = getAppearance();

    // Prepare Data
    let textSize = 's1';
    if (size === 'large') textSize = 'h1';
    if (size === 'small') textSize = 'b1';
    if (size === 'extra-small') textSize = 'b3';

    // Get data
    useEffect(() => {
      if (waitSrc !== tinyImageUrl) {
        setWaitSrc(tinyImageUrl);
        setIsLoading(0);
      }

      if (isLoading < 1) {
        // Complete checker
        let mainMime = [];
        let mainBlob = null;
        let mainSrc = null;
        let isLoadingProgress = 0;
        const isComplete = () => {
          if (isLoading < 2 && isLoadingProgress < 1) {
            // Normal complete
            if (
              !mainSrc ||
              !appearanceSettings.useFreezePlugin ||
              !tinyImageAnimUrl ||
              !mainBlob ||
              mainMime[1] !== 'gif'
            ) {
              if (tinyImageUrl === waitSrc) setIsLoading(2);
            }
            // FreezePlugin part now
            else {
              const mainBlobId = blobUrlManager.getById(`userFreezeAvatar:${mainSrc}`);
              if (!mainBlobId) {
                // Prepare to load image
                const img = new Image();
                img.onload = () => {
                  // Create canvas
                  const c = document.createElement('canvas');
                  var w = (c.width = img.width);
                  var h = (c.height = img.height);

                  // Draw canvas
                  c.getContext('2d').drawImage(img, 0, 0, w, h);

                  // Freeze gif now
                  try {
                    // Get blob
                    c.toBlob((canvasBlob) => {
                      if (canvasBlob) {
                        blobUrlManager
                          .insert(canvasBlob, {
                            freeze: true,
                            group: `user_avatars`,
                            id: `userFreezeAvatar:${mainSrc}`,
                          })
                          .then((newTinyUrl) => {
                            if (tinyImageUrl === waitSrc) {
                              // Set data
                              setImgMime(mainMime);
                              setImgError(null);

                              setBlobSrc(newTinyUrl);
                              setImgSrc(newTinyUrl);

                              // Complete
                              setIsLoading(2);
                            }
                          })
                          .catch((err) => {
                            if (tinyImageUrl === waitSrc) {
                              setImgError(err.message);
                              setIsLoading(2);
                            }
                          });
                      } else {
                        if (tinyImageUrl === waitSrc) {
                          const err = new Error('Fail to create image blob.');
                          console.log(err);
                          setImgError(err.message);
                          setIsLoading(2);
                        }
                      }
                    }, 'image/gif');
                  } catch (err) {
                    if (tinyImageUrl === waitSrc) {
                      // Error
                      console.error(err);
                      setBlobSrc(null);
                      setImgSrc(null);
                      setImgMime([]);
                      setImgError(err.message);
                      setIsLoading(2);
                    }
                  }
                };

                // Error
                img.onerror = (err) => {
                  if (tinyImageUrl === waitSrc) {
                    setImgError(err.message);
                    setIsLoading(2);
                  }
                };

                // Load now
                img.src = mainBlob;
              }

              // Get cache
              else {
                // Set data
                setImgMime(mainMime);
                setImgError(null);

                setBlobSrc(mainBlobId);
                setImgSrc(mainBlobId);
              }
            }
          }
        };

        // Active load progress
        const progressLoad = (
          tnSrc,
          tinySrc,
          setTinyBlob,
          setTnSrc,
          setError,
          setTinyMime,
          isAnim,
        ) => {
          // Enable loading mode
          setIsLoading(1);
          setError(null);

          // The new image is string
          if (typeof tinySrc === 'string' && tinySrc.length > 0) {
            if (isAnim) mainSrc = tinySrc;
            // Exist blob cache?
            const blobFromId = blobUrlManager.getById(`userAvatar:${tinySrc}`);
            if (blobFromId) {
              if (tinyImageUrl === waitSrc) {
                setTinyMime(blobUrlManager.getMime(blobFromId));
                setTinyBlob(blobFromId);
                setTnSrc(tinySrc);
                setError(null);
                if (isAnim) mainBlob = blobFromId;
              }
            }

            // Nope. Let's create a new one.
            else {
              // Reset image data
              if (tinyImageUrl === waitSrc) {
                setTnSrc(null);
                setTinyBlob(null);
                setTinyMime([]);
                setError(null);
                if (isAnim) mainBlob = null;
              }

              // Is normal image? Reset the animation version too.
              if (!isAnim) {
                if (tinyImageUrl === waitSrc) {
                  setBlobAnimSrc(null);
                  setImgAnimSrc(null);
                  setImgMimeAnim([]);
                  setImgAnimError(null);
                }
              }

              // Add loading progress...
              isLoadingProgress++;
              mxcUrl
                .focusFetchBlob(tinySrc)
                .then((blobFromFetch) => {
                  const mime =
                    typeof blobFromFetch.type === 'string' ? blobFromFetch.type.split('/') : [];
                  if (isAnim) mainMime = mime;
                  if (mime[0] === 'image' && imageExts.indexOf(mime[1]) > -1) {
                    if (tinyImageUrl === waitSrc) setTinyMime(mime);
                    return blobUrlManager.insert(blobFromFetch, {
                      freeze: true,
                      group: `user_avatars`,
                      id: `userAvatar:${tinySrc}`,
                    });
                  }
                  throw new Error(
                    `INVALID IMAGE MIME MXC! The "${tinySrc}" is "${blobFromFetch.type}".`,
                  );
                })
                // Complete
                .then((blobUrl) => {
                  // Insert data
                  if (tinyImageUrl === waitSrc) {
                    setTinyBlob(blobUrl);
                    setTnSrc(tinySrc);
                    setError(null);
                    if (isAnim) mainBlob = blobUrl;
                  }

                  // Check the progress
                  isLoadingProgress--;
                  isComplete();
                })
                // Error
                .catch((err) => {
                  // Show console error
                  console.error(err);

                  // Set image error
                  if (tinyImageUrl === waitSrc) {
                    setTinyBlob(ImageBrokenSVG);
                    setTnSrc(tinySrc);
                    setTinyMime([]);
                    setError(err.message);
                    if (isAnim) mainBlob = ImageBrokenSVG;
                  }

                  // Check the progress
                  isLoadingProgress--;
                  isComplete();
                });
            }
          }
          // Nothing
          else {
            if (tinyImageUrl === waitSrc) {
              setTnSrc(null);
              setTinyBlob(null);
              setTinyMime([]);
              setError(null);
              if (isAnim) mainBlob = null;
            }
          }
        };

        // Execute the image loading

        // Normal image
        if (
          !tinyImageUrl ||
          (!tinyImageUrl.startsWith('blob:') && !tinyImageUrl.startsWith('./'))
        ) {
          if (!appearanceSettings.useFreezePlugin || !tinyImageAnimUrl)
            progressLoad(
              imgSrc,
              tinyImageUrl,
              setBlobSrc,
              setImgSrc,
              setImgError,
              setImgMime,
              false,
            );
          else {
            setBlobSrc(null);
            setImgSrc(null);
            setImgMime([]);
            setImgError(null);
          }
        } else {
          if (tinyImageUrl.startsWith('./')) {
            const filename = tinyImageUrl.split('.');
            setImgMime(['image', filename[filename.length - 1]]);
          }
          setBlobSrc(tinyImageUrl);
          setImgSrc(tinyImageUrl);
        }

        // Anim image
        if (
          !tinyImageAnimUrl ||
          (!tinyImageAnimUrl.startsWith('blob:') && !tinyImageAnimUrl.startsWith('./'))
        ) {
          progressLoad(
            imgAnimSrc,
            tinyImageAnimUrl,
            setBlobAnimSrc,
            setImgAnimSrc,
            setImgAnimError,
            setImgMimeAnim,
            true,
          );
        } else {
          if (tinyImageAnimUrl.startsWith('./')) {
            const filename = tinyImageAnimUrl.split('.');
            setImgMimeAnim(['image', filename[filename.length - 1]]);
          }
          setBlobAnimSrc(tinyImageAnimUrl);
          setBlobAnimSrc(tinyImageAnimUrl);
        }

        // Check the progress
        isComplete();
      }

      // Anim Parents Counter
      if (blobAnimSrc && blobAnimSrc !== blobSrc) {
        let tinyNode;
        if (typeof imageAnimSrc === 'string' && imageAnimSrc.length > 0) {
          const img = $(imgRef.current);
          if (img.length > 0) {
            tinyNode = img.get(0);
            for (let i = 0; i < animParentsCount; i++) {
              tinyNode = tinyNode.parentNode;
            }
          }
        }

        const animationTransitionIn = () => setUseAnimation(true);
        const animationTransitionOut = () => setUseAnimation(false);
        const tinyQuery = tinyNode ? $(tinyNode) : null;
        if (tinyNode) {
          tinyQuery.on('mouseover', animationTransitionIn);
          tinyQuery.on('mouseout', animationTransitionOut);
        }

        return () => {
          if (tinyNode) {
            tinyQuery.off('mouseover', animationTransitionIn);
            tinyQuery.off('mouseout', animationTransitionOut);
          }
        };
      }
    });

    // Image
    const tinyImg = () =>
      isLoading >= 2 && (
        <img
          ref={theRef}
          className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
          draggable="false"
          src_url={tinyImageUrl}
          src_anim_url={tinyImageAnimUrl}
          src={
            blobSrc &&
            ((Array.isArray(imgMime) && imgMime[0] === 'image') || tinyImageUrl.startsWith('blob:'))
              ? !blobAnimSrc ||
                blobAnimSrc === blobSrc ||
                !useAnimation ||
                (Array.isArray(imgMimeAnim) && imgMimeAnim[1] !== 'gif')
                ? blobSrc
                : blobAnimSrc
              : ImageBrokenSVG
          }
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
    const isImage = tinyImageUrl !== null || isDefaultImage;
    return (
      <div
        onClick={onClick}
        ref={imgRef}
        className={`avatar-container${`${className ? ` ${className}` : ''}`} noselect${isImage && isLoading < 2 ? '' : ' image-react-loaded'}`}
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
