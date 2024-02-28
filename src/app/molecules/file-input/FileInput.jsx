import React from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FileInput = React.forwardRef(({ onChange, style, accept, required, hidden }, ref) => {
  if (!Capacitor.isNativePlatform()) {
    return (
      <input
        ref={ref}
        onChange={onChange}
        style={hidden ? { display: 'none' } : style}
        type="file"
        accept={accept}
        required={required}
      />
    );
  }
});

const fileInputClick = (inputRef) => {
  if (!Capacitor.isNativePlatform()) {
    if (inputRef.current) inputRef.current.click();
  }
};

const fileInputValue = (inputRef, value) => {
  if (typeof value !== 'undefined') {
    if (!Capacitor.isNativePlatform()) {
      if (inputRef.current) inputRef.current.value = value;
    }
  } else {
    if (!Capacitor.isNativePlatform()) {
      if (inputRef.current) return inputRef.current.value;
      return null;
    }
    return null;
  }
};

FileInput.defaultProps = {
  style: null,
  accept: null,
  onChange: null,
  required: false,
  hidden: false,
};
FileInput.propTypes = {
  accept: PropTypes.string,
  style: PropTypes.string,
  required: PropTypes.bool,
  hidden: PropTypes.bool,
  onChange: PropTypes.func,
};

export default FileInput;
export { fileInputClick, fileInputValue };