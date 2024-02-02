import React from 'react';
import PropTypes from 'prop-types';

function Toggle({ isActive, onToggle, disabled, className }) {
  const tinyClass = `${className ? `${className} ` : ''}toggle${isActive ? ' toggle--active' : ''}`;
  if (onToggle === null) return <span className={className} />;

  return (
    <button
      onClick={() => onToggle(!isActive)}
      className={tinyClass}
      type="button"
      disabled={disabled}
    />
  );
}

Toggle.defaultProps = {
  className: null,
  isActive: false,
  disabled: false,
  onToggle: null,
};

Toggle.propTypes = {
  className: PropTypes.string,
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Toggle;
