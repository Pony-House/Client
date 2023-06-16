import React from 'react';
import PropTypes from 'prop-types';
import './ImagePackItem.scss';

import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import Avatar from '../../atoms/avatar/Avatar';
import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import RawIcon from '../../atoms/system-icons/RawIcon';
import IconButton from '../../atoms/button/IconButton';
import ImagePackUsageSelector from './ImagePackUsageSelector';

function ImagePackItem({
  url, shortcode, usage, onUsageChange, onDelete, onRename,
}) {
  const handleUsageSelect = (event) => {
    openReusableContextMenu(
      'bottom',
      getEventCords(event, '.btn-link'),
      (closeMenu) => (
        <ImagePackUsageSelector
          usage={usage}
          onSelect={(newUsage) => {
            onUsageChange(shortcode, newUsage);
            closeMenu();
          }}
        />
      ),
    );
  };

  return (
    <div className="image-pack-item">
      <Avatar imageSrc={url} size="extra-small" text={shortcode} bgColor="black" />
      <div className="image-pack-item__content">
        <Text>{shortcode}</Text>
      </div>
      <div className="image-pack-item__usage">
        <div className="image-pack-item__btn">
          {onRename && <IconButton tooltip="Rename" size="extra-small" fa="fa-solid fa-pencil" onClick={() => onRename(shortcode)} />}
          {onDelete && <IconButton tooltip="Delete" size="extra-small" fa="fa-solid fa-trash-can" onClick={() => onDelete(shortcode)} />}
        </div>
        <Button onClick={onUsageChange ? handleUsageSelect : undefined}>
          {onUsageChange && <RawIcon fa="fa-solid fa-check" size="extra-small" />}
          <Text variant="b2">
            {usage === 'emoticon' && 'Emoji'}
            {usage === 'sticker' && 'Sticker'}
            {usage === 'both' && 'Both'}
          </Text>
        </Button>
      </div>
    </div>
  );
}

ImagePackItem.defaultProps = {
  onUsageChange: null,
  onDelete: null,
  onRename: null,
};
ImagePackItem.propTypes = {
  url: PropTypes.string.isRequired,
  shortcode: PropTypes.string.isRequired,
  usage: PropTypes.oneOf(['emoticon', 'sticker', 'both']).isRequired,
  onUsageChange: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
};

export default ImagePackItem;
