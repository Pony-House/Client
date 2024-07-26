import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import blobUrlManager from '@src/util/libs/blobUrlManager';
import initMatrix from '@src/client/initMatrix';
import { imageExts } from '@src/util/MimesUtil';

import { getAppearance } from '../../../util/libs/appearance';

const getTinyUrl = (mxcUrl, src) => {
  return typeof src === 'string' && src.startsWith('mxc://') && mxcUrl && mxcUrl.toHttp
    ? mxcUrl.toHttp(src)
    : src;
};

const Img = React.forwardRef(
  (
    {
      bgColor = 0,
      animParentsCount = 0,
      draggable = 'false',
      style = null,
      height = null,
      width = null,
      src = null,
      animSrc = null,
      alt = null,
      className = null,
      id = null,
      onLoad = null,
      onClick = null,
      onError = null,
      onLoadingChange = null,
      dataMxEmoticon = null,
      isDefaultImage = false,
      disableBase = false,
      isObj = false,
      getDefaultImage = null,
      customMxcUrl = null,
    },
    ref,
  ) => {
    // Ref
    const mxcUrl = initMatrix.mxcUrl || customMxcUrl;
    const imgRef = ref || useRef(null);

    const url = getTinyUrl(mxcUrl, src);
    const animUrl = getTinyUrl(mxcUrl, animSrc);

    // Image Broken
    let ImageBrokenSVG = './img/svg/image-broken.svg';

    // Get Url
    let tinyImageUrl = url;
    let tinyImageAnimUrl = animUrl;
    if (
      isDefaultImage &&
      getDefaultImage &&
      (typeof bgColor === 'number' || typeof bgColor === 'string')
    ) {
      const defaultAvatar = getDefaultImage(bgColor);
      if (typeof tinyImageUrl !== 'string' || tinyImageUrl.length < 1) {
        tinyImageUrl = defaultAvatar;
      }
      ImageBrokenSVG = defaultAvatar;
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

    // Get data
    useEffect(() => {
      if (waitSrc !== tinyImageUrl) {
        setWaitSrc(tinyImageUrl);
        setIsLoading(0);
        if (onLoadingChange) onLoadingChange(0);
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
              if (tinyImageUrl === waitSrc) {
                setIsLoading(2);
                if (onLoadingChange) onLoadingChange(2);
              }
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
                              if (onLoadingChange) onLoadingChange(2);
                            }
                          })
                          .catch((err) => {
                            if (tinyImageUrl === waitSrc) {
                              setImgError(err.message);
                              setIsLoading(2);
                              if (onLoadingChange) onLoadingChange(2);
                              onError(err);
                            }
                          });
                      } else {
                        if (tinyImageUrl === waitSrc) {
                          const err = new Error('Fail to create image blob.');
                          setImgError(err.message);
                          setIsLoading(2);
                          if (onLoadingChange) onLoadingChange(2);
                          onError(err);
                        }
                      }
                    }, 'image/gif');
                  } catch (err) {
                    if (tinyImageUrl === waitSrc) {
                      // Error
                      setBlobSrc(null);
                      setImgSrc(null);
                      setImgMime([]);
                      setImgError(err.message);
                      setIsLoading(2);
                      if (onLoadingChange) onLoadingChange(2);
                      onError(err);
                    }
                  }
                };

                // Error
                img.onerror = (err) => {
                  if (tinyImageUrl === waitSrc) {
                    setImgError(err.message);
                    setIsLoading(2);
                    if (onLoadingChange) onLoadingChange(2);
                    onError(err);
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
          if (onLoadingChange) onLoadingChange(1);
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
                  // Set image error
                  if (tinyImageUrl === waitSrc) {
                    setTinyBlob(ImageBrokenSVG);
                    setTnSrc(tinySrc);
                    setTinyMime([]);
                    setError(err.message);
                    onError(err);
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
          setImgAnimSrc(tinyImageAnimUrl);
        }

        // Check the progress
        isComplete();
      }

      // Anim Parents Counter
      if (blobAnimSrc && blobAnimSrc !== blobSrc) {
        let tinyNode;
        if (typeof animUrl === 'string' && animUrl.length > 0) {
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
    if (isLoading >= 2) {
      const theImage =
        blobSrc &&
        ((Array.isArray(imgMime) && imgMime[0] === 'image') || tinyImageUrl.startsWith('blob:'))
          ? !blobAnimSrc ||
            blobAnimSrc === blobSrc ||
            !useAnimation ||
            (Array.isArray(imgMimeAnim) && imgMimeAnim[1] !== 'gif')
            ? blobSrc
            : blobAnimSrc
          : ImageBrokenSVG;

      if (!isObj)
        return (
          <img
            onLoad={onLoad}
            className={className}
            onClick={onClick}
            ref={imgRef}
            data-mx-emoticon={dataMxEmoticon}
            height={height}
            width={width}
            id={id}
            style={style}
            draggable={draggable}
            src_url={tinyImageUrl}
            src_anim_url={tinyImageAnimUrl}
            alt={alt}
            onError={({ currentTarget }) => {
              currentTarget.onerror = onError;
              if (tinyImageUrl === waitSrc) {
                setImgSrc(ImageBrokenSVG);
                setImgAnimSrc(ImageBrokenSVG);
                setBlobSrc(ImageBrokenSVG);
                setBlobAnimSrc(ImageBrokenSVG);
                setIsLoading(2);
                if (onLoadingChange) onLoadingChange(2);
              }
            }}
            src={theImage}
          />
        );
      return { src: theImage, loading: false, href: tinyImageUrl, hrefAnim: tinyImageAnimUrl };
    }

    // Loading Image base
    else if (!disableBase) {
      const finalStyle = {};
      if (typeof height === 'number') finalStyle.height = height;
      if (typeof width === 'number') finalStyle.width = width;

      if (style) {
        for (const item in style) {
          finalStyle[item] = style[item];
        }
      }

      if (!isObj)
        return (
          <div
            className={`d-inline-block img-container${className ? ` ${className}` : ''}`}
            onClick={onClick}
            ref={imgRef}
            data-mx-emoticon={dataMxEmoticon}
            height={height}
            width={width}
            id={id}
            style={finalStyle}
            src_url={tinyImageUrl}
            src_anim_url={tinyImageAnimUrl}
            alt={alt}
          />
        );
      return { src: null, loading: true, href: tinyImageUrl, hrefAnim: tinyImageAnimUrl };
    }

    // Nothing
    if (!isObj) return null;
    return { src: null, loading: false, href: tinyImageUrl, hrefAnim: tinyImageAnimUrl };
  },
);

const imgPropTypes = {
  onLoadingChange: PropTypes.func,
  getDefaultImage: PropTypes.func,
  bgColor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  animParentsCount: PropTypes.number,
  isDefaultImage: PropTypes.bool,
  disableBase: PropTypes.bool,
  isObj: PropTypes.bool,
  dataMxEmoticon: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  draggable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  src: PropTypes.string,
  animSrc: PropTypes.string,
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
  bgColor = 0,
  animParentsCount = 0,
  draggable = 'false',
  style = null,
  height = null,
  width = null,
  src = null,
  animSrc = null,
  alt = null,
  className = null,
  id = null,
  onLoad = null,
  onClick = null,
  onError = null,
  onLoadingChange = null,
  dataMxEmoticon = null,
  isDefaultImage = false,
  disableBase = false,
  isObj = false,
  getDefaultImage = null,
  customMxcUrl = null,
}) {
  const mxcUrl = initMatrix.mxcUrl || customMxcUrl;

  const url = getTinyUrl(mxcUrl, src);
  const animUrl = getTinyUrl(animSrc);

  // Image Broken
  let ImageBrokenSVG = './img/svg/image-broken.svg';

  // Get Url
  let tinyImageUrl = url;
  let tinyImageAnimUrl = animUrl;
  if (
    isDefaultImage &&
    getDefaultImage &&
    (typeof bgColor === 'number' || typeof bgColor === 'string')
  ) {
    const defaultAvatar = getDefaultImage(bgColor);
    if (typeof tinyImageUrl !== 'string' || tinyImageUrl.length < 1) {
      tinyImageUrl = defaultAvatar;
    }
    ImageBrokenSVG = defaultAvatar;
  }

  // Normal image base
  let img;
  if (!disableBase) {
    // Build container
    img = $('<div>', {
      class: `d-inline-block img-container${className ? ` ${className}` : ''}`,
      'data-mx-emoticon': dataMxEmoticon,
      height,
      width,
      id,
      alt,
      src_url: tinyImageUrl,
      src_anim_url: tinyImageAnimUrl,
    });

    // Insert Data
    if (style) img.css(style);
    if (onLoad) img.on('load', onLoad);
    if (onClick) img.on('click', onClick);
    if (onError) img.on('error', onError);
  }

  // Nope
  else {
    img = $('<span>');
  }

  // Start image script
  const startLoadImage = () => {
    const tinyComplete = () => {
      const ops = {
        'data-mx-emoticon': dataMxEmoticon,
        id,
        class: className,
        alt,
        height,
        width,
      };

      const finalImg = $('<img>', ops);
      if (!draggable) img.attr('draggable', 'false');
      img.replaceWith(finalImg);

      finalImg.on('load', (event) => {
        if (onLoadingChange) onLoadingChange(2);
        img.addClass('image-react-loaded');
        img.removeClass('img-container');
      });

      finalImg.on('error', (event) => {
        if (onLoadingChange) onLoadingChange(2);
        const e = event.originalEvent;
        e.target.src = ImageBrokenSVG;
      });

      if (style) finalImg.css(style);
      if (onLoad) finalImg.on('load', onLoad);
      if (onClick) finalImg.on('click', onClick);
      if (onError) finalImg.on('error', onError);

      finalImg.attr('src', tinyImageUrl);
    };

    tinyComplete();
  };

  // Complete
  setTimeout(() => startLoadImage(), 1);
  return img;
}

ImgJquery.propTypes = imgPropTypes;

export { ImgJquery };
