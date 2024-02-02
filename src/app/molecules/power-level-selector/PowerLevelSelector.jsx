import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '../../atoms/button/IconButton';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';

function PowerLevelSelector({ value, max, onSelect }) {
  const handleSubmit = (e) => {
    const powerLevel = e.target.elements['power-level']?.value;
    if (!powerLevel) return;
    onSelect(Number(powerLevel));
  };

  return (
    <div className="power-level-selector">
      <MenuHeader>Power level selector</MenuHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <input
          className="form-control form-control-bg"
          defaultValue={value}
          type="number"
          name="power-level"
          placeholder="Power level"
          max={max}
          autoComplete="off"
          required
        />
        <IconButton customColor="null" variant="primary" fa="fa-solid fa-check" type="submit" />
      </form>
      {max >= 0 && <MenuHeader>Presets</MenuHeader>}
      {max >= 100 && (
        <MenuItem
          className={value === 100 ? 'text-start btn-text-success' : 'text-start'}
          onClick={() => onSelect(100)}
        >
          Admin - 100
        </MenuItem>
      )}
      {max >= 50 && (
        <MenuItem
          className={value === 50 ? 'text-start btn-text-success' : 'text-start'}
          onClick={() => onSelect(50)}
        >
          Mod - 50
        </MenuItem>
      )}
      {max >= 0 && (
        <MenuItem
          className={value === 0 ? 'text-start btn-text-success' : 'text-start'}
          onClick={() => onSelect(0)}
        >
          Member - 0
        </MenuItem>
      )}
    </div>
  );
}

PowerLevelSelector.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PowerLevelSelector;
