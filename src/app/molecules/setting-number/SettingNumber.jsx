import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

export const SettingNumber = React.forwardRef(
  (
    {
      disabled = false,
      value = 0,
      placeHolder = null,
      min = null,
      max = null,
      onChange = null,
      content = null,
    },
    ref,
  ) => {
    const inputRef = ref || useRef(null);

    useEffect(() => {
      const inputNumber = $(inputRef.current);
      const numberValidator = (event) => {
        const el = $(event.target);

        const textValue = el.val();
        const tinyValue = Number(textValue);
        let validated = true;

        if (Number.isNaN(tinyValue) || !Number.isFinite(tinyValue)) {
          el.val(value);
          validated = false;
        } else if (!Number.isNaN(min) && Number.isFinite(min) && tinyValue < min) {
          el.val(min);
          validated = false;
        } else if (!Number.isNaN(max) && Number.isFinite(max) && tinyValue > max) {
          el.val(max);
          validated = false;
        } else if (textValue !== String(tinyValue)) {
          el.val(tinyValue);
        }

        const isChange = event.type === 'change';
        const isEnter = event.type === 'keypress' && event.which === 13;
        if (validated && (isChange || isEnter) && onChange) {
          onChange(tinyValue, event.target, el, { isChange, isEnter });
        }
      };

      inputNumber.val(value);
      inputNumber.on('change keyup keydown keypress', numberValidator);
      return () => {
        inputNumber.off('change keyup keydown keypress', numberValidator);
      };
    });

    return (
      <>
        <input
          disabled={disabled}
          ref={inputRef}
          type="number"
          max={max}
          min={min}
          placeholder={placeHolder}
          className={`form-control form-control-bg mt-2 mb-1${disabled ? ' disabled' : ''}`}
        />
        {content}
      </>
    );
  },
);

SettingNumber.propTypes = {
  disabled: PropTypes.bool,
  placeHolder: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.number,
  content: PropTypes.node,
};

export default SettingNumber;
