import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function SettingsText({ value = '', maxLength = null, onChange = null, content = null }) {
  const inputRef = useRef(null);

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
        !isNaN(maxLength) &&
        isFinite(maxLength) &&
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

      if (validated && event.type === 'change' && onChange) {
        onChange(tinyValue, event.target, el);
      }
    };

    if (inputText.val().length < 1) inputText.val(value);
    inputText.on('change keyup keydown keypress', textValidator);
    return () => {
      inputText.off('change keyup keydown keypress', textValidator);
    };
  });

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        maxLength={maxLength}
        className="form-control form-control-bg mt-2 mb-1"
      />
      {content}
    </>
  );
}

SettingsText.propTypes = {
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  content: PropTypes.node,
};

export default SettingsText;
