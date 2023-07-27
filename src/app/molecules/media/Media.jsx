import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import encrypt from 'browser-encrypt-attachment';

import { BlurhashCanvas } from 'react-blurhash';
import imageViewer from '../../../util/imageViewer';
import { chatboxScrollToBottom } from '../../../util/tools';
import Tooltip from '../../atoms/tooltip/Tooltip';
import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Spinner from '../../atoms/spinner/Spinner';

import { getBlobSafeMimeType } from '../../../util/mimetypes';

async function getDecryptedBlob(response, type, decryptData) {
  const arrayBuffer = await response.arrayBuffer();
  const dataArray = await encrypt.decryptAttachment(arrayBuffer, decryptData);
  const blob = new Blob([dataArray], { type: getBlobSafeMimeType(type) });
  return blob;
}

async function getUrl(link, type, decryptData) {
  try {
    const response = await fetch(link, { method: 'GET' });
    if (decryptData !== null) {
      return URL.createObjectURL(await getDecryptedBlob(response, type, decryptData));
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    return link;
  }
}

function getNativeHeight(width, height, maxWidth = 296) {
  const scale = maxWidth / width;
  const result = scale * height;
  if (typeof result === 'number' && !Number.isNaN(result)) {
    return scale * height;
  }
  return '';
}

function FileHeader({
  name, link, external, disableChatScroll,
  file, type,
}) {
  const [url, setUrl] = useState(null);

  async function getFile() {
    const myUrl = await getUrl(link, type, file);
    setUrl(myUrl);
  }

  async function handleDownload(e) {
    if (file !== null && url === null) {
      e.preventDefault();
      await getFile();
      e.target.click();
    }
  }

  if (!disableChatScroll) chatboxScrollToBottom();
  return (
    <div className="file-header">
      <Text className="file-name" variant="b3">{name}</Text>
      {link !== null && (
        <>
          {
            external && (
              <IconButton
                size="extra-small"
                tooltip="Open in new tab"
                fa="fa-solid fa-arrow-up-right-from-square"
                onClick={() => window.open(url || link)}
              />
            )
          }
          <a href={url || link} download={name} target="_blank" rel="noreferrer">
            <IconButton
              size="extra-small"
              tooltip="Download"
              fa="fa-solid fa-download"
              onClick={handleDownload}
            />
          </a>
        </>
      )}
    </div>
  );
}
FileHeader.defaultProps = {
  disableChatScroll: false,
  external: false,
  file: null,
  link: null,
};
FileHeader.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  link: PropTypes.string,
  external: PropTypes.bool,
  file: PropTypes.shape({}),
  type: PropTypes.string.isRequired,
};

function File({
  name, link, file, type, disableChatScroll,
}) {
  if (!disableChatScroll) chatboxScrollToBottom();
  return (
    <div className="file-container">
      <FileHeader name={name} link={link} file={file} type={type} />
    </div>
  );
}
File.defaultProps = {
  disableChatScroll: false,
  file: null,
  type: '',
};
File.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string,
  file: PropTypes.shape({}),
};

function Image({
  name, width, height, link, file, type, blurhash, className, classImage, disableChatScroll,
}) {
  const [url, setUrl] = useState(null);
  const [blur, setBlur] = useState(true);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myUrl = await getUrl(link, type, file);
      if (unmounted) return;
      setUrl(myUrl);
    }
    fetchUrl();
    return () => {
      unmounted = true;
    };
  }, []);

  const toggleLightbox = () => {
    if (!url) return;
    setLightbox(!lightbox);
  };

  if (!disableChatScroll) chatboxScrollToBottom();

  return (
    <div className={`file-container${className ? ` ${className}` : ''}`}>
      <div
        style={{ height: width !== null ? getNativeHeight(width, height) : 'unset' }}
        className="image-container"
        role="button"
        tabIndex="0"
        onClick={toggleLightbox}
        onKeyDown={toggleLightbox}
      >
        {blurhash && blur && <BlurhashCanvas hash={blurhash} punch={1} />}
        {url !== null && (
          <img
            className={classImage}
            draggable="false"
            style={{ display: blur ? 'none' : 'unset' }}
            onLoad={event => {

              setBlur(false);
              let imageLoaded = false;
              if (!imageLoaded && event.target) {

                imageLoaded = true;
                const img = $(event.target);
                const imgAction = () => { imageViewer(lightbox, img, name, url); };

                img.off('click', imgAction);
                img.on('click', imgAction);

              }

            }}
            src={url || link}
            alt={name}
          />
        )}
      </div>
    </div>
  );
}
Image.defaultProps = {
  disableChatScroll: false,
  file: null,
  width: null,
  height: null,
  className: null,
  classImage: null,
  type: '',
  blurhash: '',
};
Image.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  link: PropTypes.string.isRequired,
  file: PropTypes.shape({}),
  type: PropTypes.string,
  className: PropTypes.string,
  classImage: PropTypes.string,
  blurhash: PropTypes.string,
};

function Sticker({
  name, height, width, link, file, type, disableChatScroll,
}) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myUrl = await getUrl(link, type, file);
      if (unmounted) return;
      setUrl(myUrl);
    }
    fetchUrl();
    return () => {
      unmounted = true;
    };
  }, []);

  if (!disableChatScroll) chatboxScrollToBottom();

  return (
    <Tooltip
      placement='top'
      content={<div className='small'>{name}</div>}
    >
      <div className="sticker-container" style={{ height: width !== null ? getNativeHeight(width, height, 170) : 'unset' }}>
        {url !== null && <img src={url || link} alt={name} />}
      </div>
    </Tooltip>
  );
}
Sticker.defaultProps = {
  disableChatScroll: false,
  file: null,
  type: '',
  width: null,
  height: null,
};
Sticker.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  link: PropTypes.string.isRequired,
  file: PropTypes.shape({}),
  type: PropTypes.string,
};

function Audio({
  name, link, type, file, disableChatScroll,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(null);

  async function loadAudio() {
    const myUrl = await getUrl(link, type, file);
    setUrl(myUrl);
    setIsLoading(false);
  }
  function handlePlayAudio() {
    setIsLoading(true);
    loadAudio();
  }

  if (!disableChatScroll) chatboxScrollToBottom();

  return (
    <div className="file-container">
      <FileHeader name={name} link={file !== null ? url : url || link} type={type} external />
      <div className="audio-container">
        {url === null && isLoading && <Spinner size="small" />}
        {url === null && !isLoading && <IconButton onClick={handlePlayAudio} tooltip="Play audio" fa="fa-solid fa-circle-play" />}
        {url !== null && (
          <audio autoPlay controls>
            <source src={url} type={getBlobSafeMimeType(type)} />
          </audio>
        )}
      </div>
    </div>
  );
}
Audio.defaultProps = {
  disableChatScroll: false,
  file: null,
  type: '',
};
Audio.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string,
  file: PropTypes.shape({}),
};

function Video({
  name, link, thumbnail, thumbnailFile, thumbnailType, disableChatScroll,
  width, height, file, type, blurhash,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(null);
  const [thumbUrl, setThumbUrl] = useState(null);
  const [blur, setBlur] = useState(true);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myThumbUrl = await getUrl(thumbnail, thumbnailType, thumbnailFile);
      if (unmounted) return;
      setThumbUrl(myThumbUrl);
    }
    if (thumbnail !== null) fetchUrl();
    return () => {
      unmounted = true;
    };
  }, []);

  const loadVideo = async () => {
    const myUrl = await getUrl(link, type, file);
    setUrl(myUrl);
    setIsLoading(false);
  };

  const handlePlayVideo = () => {
    setIsLoading(true);
    loadVideo();
  };

  if (!disableChatScroll) chatboxScrollToBottom();

  return (
    url === null ? (
      <div className="file-container">
        <FileHeader name={name} link={file !== null ? url : url || link} type={type} external />
        <div className="video-container">

          {!isLoading && <IconButton onClick={handlePlayVideo} tooltip="Play video" fa="fa-solid fa-circle-play" />}
          {blurhash && blur && <BlurhashCanvas hash={blurhash} punch={1} />}
          {thumbUrl !== null && (
            <img style={{ display: blur ? 'none' : 'unset' }} src={thumbUrl} onLoad={() => setBlur(false)} alt={name} />
          )}
          {isLoading && <Spinner size="small" />}

        </div>
      </div>
    ) : (

      <Tooltip
        placement='top'
        content={<Text variant="b2">{name}</Text>}
      >
        <div className="file-container file-open">
          <div className="video-container">

            <div className="ratio ratio-16x9 video-base">
              <video srcwidth={width} srcheight={height} autoPlay controls poster={thumbUrl}>
                <source src={url} type={getBlobSafeMimeType(type)} />
              </video>
            </div>

          </div>
        </div>
      </Tooltip>
    )
  );
}
Video.defaultProps = {
  disableChatScroll: false,
  width: null,
  height: null,
  file: null,
  thumbnail: null,
  thumbnailType: null,
  thumbnailFile: null,
  type: '',
  blurhash: null,
};
Video.propTypes = {
  disableChatScroll: PropTypes.bool,
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  thumbnailFile: PropTypes.shape({}),
  thumbnailType: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  file: PropTypes.shape({}),
  type: PropTypes.string,
  blurhash: PropTypes.string,
};

export {
  File, Image, Sticker, Audio, Video,
};
