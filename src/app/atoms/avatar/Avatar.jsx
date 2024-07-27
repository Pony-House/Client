import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { twemojifyReact } from '../../../util/twemojify';
import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

import { avatarInitials } from '../../../util/common';
import { defaultAvatar, defaultProfileBanner, defaultSpaceBanner } from './defaultAvatar';
import Img, { ImgJquery } from '../image/Image';

// isAnimateAvatarsEnabled
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
    colorCode < 0
  ) {
    colorCode = 0;
  }

  // Default Avatar
  if (typeof defaultGetItems[type] === 'function') return defaultGetItems[type](colorCode);
  return null;
};

const Avatar = React.forwardRef(
  (
    {
      isObj = false,
      onClick = null,
      onError = null,
      onLoad = null,
      onLoadingChange = null,
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
    const imgRef = ref || useRef(null);
    const [isLoading, setIsLoading] = useState(0);

    // Prepare Data
    let textSize = 's1';
    if (size === 'large') textSize = 'h1';
    if (size === 'small') textSize = 'b1';
    if (size === 'extra-small') textSize = 'b3';

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
    const tinyImg = isImage ? (
      <Img
        isObj={isObj}
        disableBase
        onError={onError}
        bgColor={bgColor}
        onLoad={onLoad}
        onClick={onClick}
        onLoadingChange={(value) => {
          setIsLoading(value);
          if (onLoadingChange) onLoadingChange(value);
        }}
        getDefaultImage={avatarDefaultColor}
        isDefaultImage={isDefaultImage}
        ref={theRef}
        src={imageSrc}
        animSrc={imageAnimSrc}
        animParentsCount={animParentsCount + 1}
        className={`avatar-react${imgClass ? ` ${imgClass}` : ''}`}
        alt={text || 'avatar'}
      />
    ) : (
      tinyIcon()
    );

    if (!isObj)
      return (
        <div
          onClick={onClick}
          ref={imgRef}
          className={`avatar-container${`${className ? ` ${className}` : ''}`} noselect${isImage && isLoading < 2 ? '' : ' image-react-loaded'}`}
        >
          {tinyImg}
        </div>
      );
    else return tinyImg;
  },
);

const imgPropTypes = {
  isObj: PropTypes.bool,
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
  onError: PropTypes.func,
  onClick: PropTypes.func,
  onLoad: PropTypes.func,
  onLoadingChange: PropTypes.func,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
};

// Props
Avatar.propTypes = imgPropTypes;
export default Avatar;

// jQuery
const AvatarJquery = ({
  isObj = false,
  onClick = null,
  onError = null,
  onLoad = null,
  onLoadingChange = null,
  text = null,
  imageSrc = null,
  imageAnimSrc = null,
  animParentsCount = 0,
  imgClass = 'img-fluid',
  className = null,
  bgColor = 'transparent',
  isDefaultImage = false,
}) => {
  const tinyBase = $('<div>', {
    class: `avatar-container${`${className ? ` ${className}` : ''}`} noselect`,
  });

  const tinyImg = ImgJquery({
    isObj,
    onClick,
    onError,
    onLoad,
    isDefaultImage: isDefaultImage,
    getDefaultImage: avatarDefaultColor,
    bgColor,
    animParentsCount,
    disableBase: true,
    alt: text || 'avatar',
    className: `avatar-react${imgClass ? ` ${imgClass}` : ''}`,
    draggable: false,
    src: imageSrc,
    animSrc: imageAnimSrc,
    onLoadingChange: (isLoading) => {
      if (isLoading >= 2) tinyBase.addClass('image-react-loaded');
      if (onLoadingChange) onLoadingChange(isLoading);
    },
  });

  if (!isObj) return tinyBase.append(tinyImg);
  return tinyImg;
};

AvatarJquery.propTypes = imgPropTypes;

export { AvatarJquery };
