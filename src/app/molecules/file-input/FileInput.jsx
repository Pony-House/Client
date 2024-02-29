import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';

import { base64ToArrayBuffer, objType } from '@src/util/tools';
import initMatrix from '@src/client/initMatrix';

// Build HTML
const FileInput = React.forwardRef(
  ({ onChange, accept, required, webkitdirectory, directory, capture, multiple }, ref) => {
    const inputRef = useRef(null);

    // Effect
    useEffect(() => {
      if (typeof onChange === 'function') {
        const fileInput = ref ? $(ref.current) : $(inputRef.current);
        const tinyChange = (event) => {
          if (!Capacitor.isNativePlatform()) {
            const changeFunc = (index = 0) => {
              if (typeof index === 'number') {
                if (event.originalEvent.target.files.item)
                  return event.originalEvent.target.files.item(index);
                return event.originalEvent.target.files[index];
              }

              if (typeof index === 'boolean' && index) {
                return event.originalEvent.target.files.length;
              }
            };
            onChange(event.originalEvent.target, changeFunc);
          }
        };

        // Events
        fileInput.on('change', tinyChange);
        return () => {
          fileInput.off('change', tinyChange);
        };
      }
    });

    return (
      <input
        ref={ref || inputRef}
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
  },
);

const uploadContent = (file, forceDefault = false) => {
  if (!Capacitor.isNativePlatform() || forceDefault) {
    return initMatrix.matrixClient.uploadContent(file);
  }
  console.log('uploadContent', Buffer.from(file.data, 'base64'));
  return initMatrix.matrixClient.uploadContent(Buffer.from(file.data, 'base64'));
};

const createObjectURL = (file, forceDefault = false) => {
  if (!Capacitor.isNativePlatform() || forceDefault) {
    return URL.createObjectURL(file);
  }
  console.log('createObjectURL', file.data);
  return URL.createObjectURL(file.data);
};

const convertToBase64Mobile = (file) => {
  if (!Capacitor.isNativePlatform()) {
    return file;
  }
  console.log('convertToBase64Mobile', file.data);
  return file.data;
};

const fileReader = (file, readerType = 'readAsText') =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (err) => reject(err);

      if (!Capacitor.isNativePlatform()) {
        reader[readerType](file);
      } else {
        console.log('fileReader', file.atob());
        fileReader(file.atob());
      }
    } catch (err) {
      reject(err);
    }
  });

// Click open file
const fileInputClick = async (inputRef, onChange) => {
  // Normal
  if (!Capacitor.isNativePlatform()) {
    if (inputRef.current) inputRef.current.click();
  }

  // Mobile
  else if (inputRef.current) {
    let perm = await Filesystem.checkPermissions();
    if (perm && perm.publicStorage === 'prompt') perm = await Filesystem.requestPermissions();
    if (perm && perm.publicStorage !== 'granted') {
      throw new Error('User denied mobile permissions!');
    }

    // const webkitdirectory = inputRef.current.hasAttribute('webkitdirectory');
    // const directory = inputRef.current.hasAttribute('directory');
    const multiple = inputRef.current.hasAttribute('multiple');

    // const capture = inputRef.current.getAttribute('capture');
    const accept = inputRef.current.getAttribute('accept');

    const result = await FilePicker.pickFiles({
      types: typeof accept === 'string' ? accept.replace(/\, /g, ',').split(',') : null,
      readData: true,
      multiple,
    });

    if (objType(result, 'object') && Array.isArray(result.files)) {
      const changeFunc = (index = 0) => {
        const sendResult = (i) => {
          result.files[i].type = result.files[i].mimeType;
          result.files[i].lastModified = result.files[i].modifiedAt;
          result.files[i].lastModifiedDate = new Date(result.files[i].modifiedAt);
          result.files[i].arrayBuffer = () => base64ToArrayBuffer(result.files[i].data);
          result.files[i].toBuffer = () => Buffer.from(result.files[i].data, 'base64');
          result.files[i].atob = () => atob(result.files[i].data);
          return result.files[i];
        };

        if (typeof index === 'number') {
          return sendResult(index);
        }

        if (typeof index === 'boolean' && index) {
          return result.files.length;
        }
      };
      onChange(inputRef.current, changeFunc);
    }
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
export {
  fileInputClick,
  fileInputValue,
  uploadContent,
  fileReader,
  createObjectURL,
  convertToBase64Mobile,
};
