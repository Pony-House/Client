import React from 'react';
import PropTypes from 'prop-types';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function Checkbox({ name, variant, isActive, onToggle, disabled, tabIndex, className }) {
  const newClassName = `checkbox checkbox-${variant}${isActive ? ' checkbox--active' : ''}${typeof className === 'string' ? ` ${className}` : ''}`;
  if (onToggle === null) return <span className={newClassName} />;

  return (
    <>
      {typeof name === 'string' ? (
        <input type="checkbox" className="d-none" name={name} checked={isActive} />
      ) : null}

      <button
        onClick={() => onToggle(!isActive)}
        className={newClassName}
        type="button"
        disabled={disabled}
        tabIndex={tabIndex}
      />
    </>
  );
}

Checkbox.defaultProps = {
  name: null,
  variant: 'primary',
  isActive: false,
  onToggle: null,
  disabled: false,
  tabIndex: 0,
  className: null,
};

Checkbox.propTypes = {
  variant: PropTypes.oneOf(bsColorsArray),
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default Checkbox;
