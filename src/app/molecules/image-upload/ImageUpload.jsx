import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './ImageUpload.scss';

import initMatrix from '../../../client/initMatrix';

import Avatar from '../../atoms/avatar/Avatar';
import Spinner from '../../atoms/spinner/Spinner';
import RawIcon from '../../atoms/system-icons/RawIcon';

function ImageUpload({
  text, bgColor, imageSrc, onUpload, onRequestRemove, className,
  size,
}) {
  const [uploadPromise, setUploadPromise] = useState(null);
  const uploadImageRef = useRef(null);

  async function uploadImage(e) {
    const file = e.target.files.item(0);
    if (file === null) return;
    try {
      const uPromise = initMatrix.matrixClient.uploadContent(file);
      setUploadPromise(uPromise);

      const res = await uPromise;
      if (typeof res?.content_uri === 'string') onUpload(res.content_uri);
      setUploadPromise(null);
    } catch {
      setUploadPromise(null);
    }
    uploadImageRef.current.value = null;
  }

  function cancelUpload() {
    initMatrix.matrixClient.cancelUpload(uploadPromise);
    setUploadPromise(null);
    uploadImageRef.current.value = null;
  }

  return (
    <div className={`img-upload__wrapper ${className}`}>
      <button
        type="button"
        className="img-upload"
        onClick={() => {
          if (uploadPromise !== null) return;
          uploadImageRef.current.click();
        }}
      >
        <Avatar
          imageSrc={imageSrc}
          text={text}
          bgColor={bgColor}
          size={size}
        />
        <div className={`img-upload__process ${uploadPromise === null ? ' img-upload__process--stopped' : ''}`}>
          {uploadPromise === null && (
            size === 'large'
              ? <div className="very-small text-gray"><strong>Upload</strong></div>
              : <RawIcon fa="fa-solid fa-plus" color="white" />
          )}
          {uploadPromise !== null && <Spinner size="small" />}
        </div>
      </button>
      {(typeof imageSrc === 'string' || uploadPromise !== null) && (
        <button
          className="img-upload__btn-cancel noselect"
          type="button"
          onClick={uploadPromise === null ? onRequestRemove : cancelUpload}
        >
          <div className="very-small text-danger">{uploadPromise ? 'Cancel' : 'Remove'}</div>
        </button>
      )}
      <input onChange={uploadImage} style={{ display: 'none' }} ref={uploadImageRef} type="file" accept="image/*" />
    </div>
  );
}

ImageUpload.defaultProps = {
  className: '',
  text: null,
  bgColor: 'transparent',
  imageSrc: null,
  size: 'large',
};

ImageUpload.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  bgColor: PropTypes.string,
  imageSrc: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRequestRemove: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['large', 'normal']),
};

export default ImageUpload;
