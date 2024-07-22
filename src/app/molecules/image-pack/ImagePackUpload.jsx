import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import emojiEditor from '@src/util/libs/emoji/EmojiEditor';
// import { scaleDownImage } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import IconButton from '../../atoms/button/IconButton';
import { updateEmojiList } from '../../../client/action/navigation';
import { getSelectRoom } from '../../../util/selectedRoom';
import FileInput, { fileInputClick, fileInputValue, uploadContent } from '../file-input/FileInput';

function ImagePackUpload({ onUpload, roomId, buttons = null }) {
  const inputRef = useRef(null);
  const shortcodeRef = useRef(null);
  const [imgFile, setImgFile] = useState(null);
  const [progress, setProgress] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!imgFile) return;

    const { shortcodeInput } = evt.target;
    const shortcode = shortcodeInput.value.trim();
    if (shortcode === '') return;

    setProgress(true);
    // const image = await scaleDownImage(imgFile, 512, 512);
    // const { content_uri: url } = await uploadContent(image, null, true);
    const { content_uri: url } = await uploadContent(imgFile);

    onUpload(shortcode, url);
    setProgress(false);
    setImgFile(null);
    shortcodeRef.current.value = '';

    if (!roomId) {
      updateEmojiList(getSelectRoom());
    } else {
      updateEmojiList(roomId);
    }
  };

  const handleFileChange = (target, getFile) => {
    const img = getFile(0);
    if (!img) return;
    setImgFile(img);
    shortcodeRef.current.value = img.name.slice(0, img.name.indexOf('.'));
    shortcodeRef.current.focus();
  };
  const handleRemove = () => {
    setImgFile(null);
    fileInputValue(inputRef, null);
    shortcodeRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="image-pack-upload">
      <FileInput
        ref={inputRef}
        onChange={handleFileChange}
        accept={emojiEditor.fileMimes}
        required
      />
      {imgFile ? (
        <div className="image-pack-upload__file">
          <IconButton onClick={handleRemove} fa="fa-solid fa-circle-plus" tooltip="Remove file" />
          <Text>{imgFile.name}</Text>
        </div>
      ) : (
        <Button onClick={() => fileInputClick(inputRef, handleFileChange)}>Import image</Button>
      )}
      <div>
        <Input forwardRef={shortcodeRef} name="shortcodeInput" placeholder="shortcode" required />
      </div>
      <Button
        className={buttons ? 'm-1' : null}
        disabled={progress}
        variant="primary"
        type="submit"
      >
        {progress ? 'Uploading...' : 'Upload'}
      </Button>
      {buttons}
    </form>
  );
}
ImagePackUpload.propTypes = {
  buttons: PropTypes.node,
  roomId: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
};

export default ImagePackUpload;
