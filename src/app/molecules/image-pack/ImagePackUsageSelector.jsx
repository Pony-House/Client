import React from 'react';
import PropTypes from 'prop-types';

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';

function ImagePackUsageSelector({ usage, onSelect }) {
  return (
    <div>
      <MenuHeader>Usage</MenuHeader>
      <MenuItem
        faSrc={usage === 'emoticon' ? "fa-solid fa-check" : undefined}
        variant={usage === 'emoticon' ? 'success' : 'link btn-bg'}
        onClick={() => onSelect('emoticon')}
      >
        Emoji
      </MenuItem>
      <MenuItem
        faSrc={usage === 'sticker' ? "fa-solid fa-check" : undefined}
        variant={usage === 'sticker' ? 'success' : 'link btn-bg'}
        onClick={() => onSelect('sticker')}
      >
        Sticker
      </MenuItem>
      <MenuItem
        faSrc={usage === 'both' ? "fa-solid fa-check" : undefined}
        variant={usage === 'both' ? 'success' : 'link btn-bg'}
        onClick={() => onSelect('both')}
      >
        Both
      </MenuItem>
    </div>
  );
}

ImagePackUsageSelector.propTypes = {
  usage: PropTypes.oneOf(['emoticon', 'sticker', 'both']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ImagePackUsageSelector;
