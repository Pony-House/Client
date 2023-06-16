import React from 'react';
import PropTypes from 'prop-types';
import './Checkbox.scss';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function Checkbox({
  variant, isActive, onToggle,
  disabled, tabIndex,
}) {

  const className = `checkbox checkbox-${variant}${isActive ? ' checkbox--active' : ''}`;
  if (onToggle === null) return <span className={className} />;

  return (
    // eslint-disable-next-line jsx-a11y/control-has-associated-label
    <button
      onClick={() => onToggle(!isActive)}
      className={className}
      type="button"
      disabled={disabled}
      tabIndex={tabIndex}
    />
  );

}

Checkbox.defaultProps = {
  variant: 'primary',
  isActive: false,
  onToggle: null,
  disabled: false,
  tabIndex: 0,
};

Checkbox.propTypes = {
  variant: PropTypes.oneOf(bsColorsArray),
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
};

export default Checkbox;
