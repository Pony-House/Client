import React from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Build HTML
const FileInput = React.forwardRef(
  ({ onChange, accept, required, webkitdirectory, directory, capture, multiple }, ref) => {
    if (!Capacitor.isNativePlatform()) {
      return (
        <input
          ref={ref}
          onChange={onChange}
          style={{ display: 'none' }}
          type="file"
          accept={
            Array.isArray(accept) ? accept.join(', ') : typeof accept === 'string' ? accept : null
          }
          required={required}
          webkitdirectory={webkitdirectory}
          directory={directory}
          capture={capture}
          multiple={multiple}
        />
      );
    }

    return (
      <input
        style={{ display: 'none' }}
        type="text"
        accept={accept}
        required={required}
        webkitdirectory={webkitdirectory}
        directory={directory}
        capture={capture}
        multiple={multiple}
      />
    );
  },
);

// Click open file
const fileInputClick = async (inputRef) => {
  if (!Capacitor.isNativePlatform()) {
    if (inputRef.current) inputRef.current.click();
  } else if (inputRef.current) {

    let perm = await Filesystem.checkPermissions();
    if (perm === 'prompt') perm = await Filesystem.requestPermissions();
    if (perm !== 'granted') {
      throw new Error('User denied mobile permissions!');
    }

    const webkitdirectory = inputRef.current.hasAttribute('webkitdirectory');
    const directory = inputRef.current.hasAttribute('directory');
    const multiple = inputRef.current.hasAttribute('multiple');

    const capture = inputRef.current.getAttribute('capture');
    const accept = inputRef.current.getAttribute('accept');

  }
};

// Get file value
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

// Validators
FileInput.defaultProps = {
  accept: null,
  onChange: null,
  capture: null,
  required: false,
  webkitdirectory: false,
  directory: false,
  multiple: false,
};
FileInput.propTypes = {
  accept: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func,
  capture: PropTypes.string,
  required: PropTypes.bool,
  webkitdirectory: PropTypes.bool,
  directory: PropTypes.bool,
  multiple: PropTypes.bool,
};

// Export
export default FileInput;
export { fileInputClick, fileInputValue };
