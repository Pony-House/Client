import React from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FileInput = React.forwardRef(({ onChange, accept, required }, ref) => {
  if (!Capacitor.isNativePlatform()) {
    return (
      <input
        ref={ref}
        onChange={onChange}
        style={{ display: 'none' }}
        type="file"
        accept={accept}
        required={required}
      />
    );
  }

  return <input style={{ display: 'none' }} type="file" accept={accept} required={required} />;
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
  accept: null,
  onChange: null,
  required: false,
};
FileInput.propTypes = {
  accept: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func,
};

export default FileInput;
export { fileInputClick, fileInputValue };
