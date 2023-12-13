import React from 'react';
import PropTypes from 'prop-types';

function RadioButton({ isActive, onToggle, disabled }) {

  if (onToggle === null) return <span className={`radio-btn${isActive ? ' radio-btn--active' : ''}`} />;

  return (
    <button
      onClick={() => onToggle(!isActive)}
      className={`radio-btn${isActive ? ' radio-btn--active' : ''}`}
      type="button"
      disabled={disabled}
    />
  );

}

RadioButton.defaultProps = {
  isActive: false,
  onToggle: null,
  disabled: false,
};

RadioButton.propTypes = {
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
};

export default RadioButton;
