import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AsYouType, getCountries, getCountryCallingCode } from 'libphonenumber-js';

export const SettingPhone = React.forwardRef(
  (
    {
      value = '',
      placeHolder = null,
      maxLength = null,
      onChange = null,
      content = null,
      disabled = false,
      filter = null,
    },
    ref,
  ) => {
    const selectChange = useRef(null);
    const inputRef = ref || useRef(null);
    const [country, setCountry] = useState(null);

    useEffect(() => {
      const inputText = $(inputRef.current);
      const selectInput = $(selectChange.current);
      const countryChanger = () => setCountry(selectInput.val());
      const textValidator = (event) => {
        // Start script
        const el = $(event.target);
        if (el.length > 0) {
          // Get values
          const selectionStart = el.get(0).selectionStart;
          const selectionEnd = el.get(0).selectionEnd;
          const oldValue = el.val();
          const diffValues = typeof value === 'string' ? value.length : 0 - oldValue.length;

          // Fix Selection
          const fixSelection = (extraAmount = 0) => {
            el.get(0).setSelectionRange(
              selectionStart + extraAmount + diffValues,
              selectionEnd + extraAmount + diffValues,
            );
          };

          // Continue script
          if (
            (oldValue.length === selectionStart &&
              oldValue.length === selectionEnd &&
              selectionStart == selectionEnd) ||
            oldValue !== value
          ) {
            // Okay
            if (oldValue.startsWith('+')) {
              const phoneNumber = new AsYouType(country !== null ? country : undefined).input(
                oldValue,
              );

              // Value
              el.focus().val('').val(phoneNumber);
              fixSelection();

              // Complete
              const isChange = event.type === 'change';
              const isEnter = event.type === 'keypress' && event.which === 13;
              if (onChange) {
                onChange(phoneNumber, event.target, el, { country, isChange, isEnter });
              }
            }

            // Invalid
            else {
              const defaultCountry = country ? getCountryCallingCode(country) : '';
              el.focus().val(`+${String(defaultCountry)}${oldValue}`);
              fixSelection(1 + String(defaultCountry).length);
              return textValidator(event);
            }
          }
        }
      };

      // Inputs
      inputText.val(value);
      inputText.on('change keyup keydown keypress', textValidator);
      selectInput.on('change', countryChanger);
      return () => {
        selectInput.off('change', countryChanger);
        inputText.off('change keyup keydown keypress', textValidator);
      };
    });

    const countries = getCountries();
    return (
      <>
        <select ref={selectChange} className="form-select form-control-bg" defaultValue={country}>
          <option>??</option>
          {countries.map((item, index) => (
            <option key={`${item}_${index}`} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          disabled={disabled}
          ref={inputRef}
          type="tel"
          maxLength={maxLength}
          placeholder={placeHolder}
          className={`form-control form-control-bg mt-2 mb-1${disabled ? ' disabled' : ''}`}
        />
        {content}
      </>
    );
  },
);

SettingPhone.propTypes = {
  filter: PropTypes.func,
  disabled: PropTypes.bool,
  placeHolder: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  content: PropTypes.node,
};

export default SettingPhone;
