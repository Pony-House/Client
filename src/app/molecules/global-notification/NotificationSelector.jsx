import React from 'react';
import PropTypes from 'prop-types';

import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';

function NotificationSelector({
  value, onSelect,
}) {
  return (
    <div>
      <MenuHeader>Notification</MenuHeader>
      <MenuItem faSrc={value === 'off' ? "fa-solid fa-check" : null} variant={value === 'off' ? 'success' : 'link btn-bg'} onClick={() => onSelect('off')}>Off</MenuItem>
      <MenuItem faSrc={value === 'on' ? "fa-solid fa-check" : null} variant={value === 'on' ? 'success' : 'link btn-bg'} onClick={() => onSelect('on')}>On</MenuItem>
      <MenuItem faSrc={value === 'noisy' ? "fa-solid fa-check" : null} variant={value === 'noisy' ? 'success' : 'link btn-bg'} onClick={() => onSelect('noisy')}>Noisy</MenuItem>
    </div>
  );
}

NotificationSelector.propTypes = {
  value: PropTypes.oneOf(['off', 'on', 'noisy']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default NotificationSelector;
