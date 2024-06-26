import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export const SettingText = React.forwardRef(
  (
    {
      value = '',
      placeHolder = null,
      maxLength = null,
      onChange = null,
      content = null,
      isPassword = false,
      isEmail = false,
      disabled = false,
    },
    ref,
  ) => {
    const inputRef = ref || useRef(null);

    useEffect(() => {
      const inputText = $(inputRef.current);
      const textValidator = (event) => {
        const el = $(event.target);

        const textValue = el.val();
        let tinyValue = '';
        let validated = true;

        if (
          typeof textValue === 'string' &&
          typeof maxLength === 'number' &&
          !Number.isNaN(maxLength) &&
          Number.isFinite(maxLength) &&
          maxLength > -1 &&
          textValue.length > maxLength
        ) {
          tinyValue = textValue.substring(0, maxLength);
          el.val(tinyValue);
        } else if (typeof textValue === 'string') {
          tinyValue = textValue;
        } else {
          validated = false;
        }

        const isChange = event.type === 'change';
        const isEnter = event.type === 'keypress' && event.which === 13;
        if (validated && (isChange || isEnter) && onChange) {
          onChange(tinyValue, event.target, el, { isChange, isEnter });
        }
      };

      inputText.val(value);
      inputText.on('change keyup keydown keypress', textValidator);
      return () => {
        inputText.off('change keyup keydown keypress', textValidator);
      };
    });

    return (
      <>
        <input
          disabled={disabled}
          ref={inputRef}
          type={!isPassword ? (!isEmail ? 'text' : 'email') : 'password'}
          maxLength={maxLength}
          placeholder={placeHolder}
          className={`form-control form-control-bg mt-2 mb-1${disabled ? ' disabled' : ''}`}
        />
        {content}
      </>
    );
  },
);

SettingText.propTypes = {
  disabled: PropTypes.bool,
  isEmail: PropTypes.bool,
  isPassword: PropTypes.bool,
  placeHolder: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  content: PropTypes.node,
};

export default SettingText;
