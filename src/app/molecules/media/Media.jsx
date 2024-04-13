import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import encrypt from 'matrix-encrypt-attachment';
import { readCustomUrl } from '@src/util/libs/mediaCache';
import { fetchFn } from '@src/client/initMatrix';
import blobUrlManager from '@src/util/libs/blobUrlManager';

import { BlurhashCanvas } from 'react-blurhash';
import imageViewer from '../../../util/imageViewer';
import Tooltip from '../../atoms/tooltip/Tooltip';
import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Spinner from '../../atoms/spinner/Spinner';

import { getBlobSafeMimeType } from '../../../util/mimetypes';
import { mediaFix } from './mediaFix';

async function getDecryptedBlob(response, type, decryptData) {
  const arrayBuffer = await response.arrayBuffer();
  const dataArray = await encrypt.decryptAttachment(arrayBuffer, decryptData);
  const blob = new Blob([dataArray], { type: getBlobSafeMimeType(type) });
  return blob;
}

async function getUrl(link, type, decryptData, roomId /* , threadId */) {
  try {
    const blobSettings = {
      freeze: true,
      // group: `roomMedia:${roomId}${typeof threadId === 'string' ? `:${threadId}` : ''}`,
      group: `roomMedia:${roomId}`,
    };
    const tinyLink = readCustomUrl(link);
    const response = await fetchFn(tinyLink, { method: 'GET' });
    if (decryptData !== null && !tinyLink.startsWith('ponyhousetemp://')) {
      const blob = await getDecryptedBlob(response, type, decryptData);
      const result = await blobUrlManager.insert(blob, blobSettings);
      return result;
    }
    const blob = await response.blob();
    const result = await blobUrlManager.insert(blob, blobSettings);
    return result;
  } catch (e) {
    console.error(e);
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

function FileHeader({ name, link, external, file, type, roomId, threadId }) {
  const [url, setUrl] = useState(null);

  async function getFile() {
    const myUrl = await getUrl(link, type, file, roomId, threadId);
    setUrl(myUrl);
  }

  async function handleDownload(e) {
    if (file !== null && url === null) {
      e.preventDefault();
      await getFile();
      e.target.click();
    }
  }

  return (
    <div className="file-header">
      <Text className="file-name" variant="b3">
        {name}
      </Text>
      {link !== null && (
        <>
          {external && (
            <IconButton
              size="extra-small"
              tooltip="Open in new tab"
              fa="fa-solid fa-arrow-up-right-from-square"
              onClick={() => window.open(url || link)}
            />
          )}
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
  external: false,
  file: null,
  link: null,
};
FileHeader.propTypes = {
  name: PropTypes.string.isRequired,
  link: PropTypes.string,
  external: PropTypes.bool,
  file: PropTypes.shape({}),
  type: PropTypes.string.isRequired,
};

function File({ name, link, file, type, roomId, threadId }) {
  return (
    <div className="file-container">
      <FileHeader
        roomId={roomId}
        threadId={threadId}
        name={name}
        link={link}
        file={file}
        type={type}
      />
    </div>
  );
}
File.defaultProps = {
  file: null,
  type: '',
};
File.propTypes = {
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string,
  file: PropTypes.shape({}),
};

function Image({
  name,
  roomId,
  threadId,
  width,
  height,
  link,
  file,
  type,
  blurhash,
  className,
  classImage,
  ignoreContainer,
  maxWidth,
}) {
  const [url, setUrl] = useState(null);
  const [blur, setBlur] = useState(true);
  const [lightbox, setLightbox] = useState(false);

  const itemEmbed = useRef(null);
  const [embedHeight, setEmbedHeight] = useState(null);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myUrl = await getUrl(link, type, file, roomId, threadId);
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

  const imgHeight = width !== null ? getNativeHeight(width, height, maxWidth) : 200;

  const imgData = url !== null && (
    <div
      style={{
        minHeight: imgHeight,
      }}
    >
      <img
        className={`${classImage}${ignoreContainer ? ` ${className}` : ''}`}
        draggable="false"
        style={{
          display: blur ? 'none' : 'unset',
          height: imgHeight,
        }}
        onLoad={(event) => {
          mediaFix(itemEmbed, embedHeight, setEmbedHeight);
          setBlur(false);
          let imageLoaded = false;
          if (!imageLoaded && event.target) {
            imageLoaded = true;
            const img = $(event.target);
            const imgAction = () => {
              imageViewer({ lightbox, imgQuery: img, name, url });
            };

            img.off('click', imgAction);
            img.on('click', imgAction);
          }
        }}
        src={url || link}
        alt={name}
      />
    </div>
  );

  useEffect(() => mediaFix(itemEmbed, embedHeight, setEmbedHeight));
  // tinyFixScrollChat();

  if (!ignoreContainer) {
    return (
      <div className={`file-container${className ? ` ${className}` : ''}`}>
        <div
          style={{ minHeight: imgHeight }}
          className="image-container"
          role="button"
          tabIndex="0"
          onClick={toggleLightbox}
          onKeyDown={toggleLightbox}
        >
          {blurhash && blur && <BlurhashCanvas hash={blurhash} punch={1} />}
          {imgData}
        </div>
      </div>
    );
  }

  return imgData;
}
Image.defaultProps = {
  maxWidth: 296,
  ignoreContainer: false,
  file: null,
  width: null,
  height: null,
  className: null,
  classImage: null,
  type: '',
  blurhash: '',
};
Image.propTypes = {
  maxWidth: PropTypes.number,
  ignoreContainer: PropTypes.bool,
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

function Sticker({ name, height, width, link, file, type, roomId, threadId }) {
  const [url, setUrl] = useState(null);

  const itemEmbed = useRef(null);
  const [embedHeight, setEmbedHeight] = useState(null);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myUrl = await getUrl(link, type, file, roomId, threadId);
      if (unmounted) return;
      setUrl(myUrl);
    }
    fetchUrl();
    return () => {
      unmounted = true;
    };
  }, []);

  useEffect(() => mediaFix(itemEmbed, embedHeight, setEmbedHeight));

  return (
    <Tooltip placement="top" content={<div className="small">{name}</div>}>
      <div
        className="sticker-container"
        style={{ height: width !== null ? getNativeHeight(width, height, 170) : 'unset' }}
      >
        {url !== null && <img src={url || link} alt={name} />}
      </div>
    </Tooltip>
  );
}
Sticker.defaultProps = {
  file: null,
  type: '',
  width: null,
  height: null,
};
Sticker.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  link: PropTypes.string.isRequired,
  file: PropTypes.shape({}),
  type: PropTypes.string,
};

function Audio({ name, link, type, file, roomId, threadId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [url, setUrl] = useState(null);

  const itemEmbed = useRef(null);
  const [embedHeight, setEmbedHeight] = useState(null);

  async function loadAudio() {
    const myUrl = await getUrl(link, type, file, roomId, threadId);
    setUrl(myUrl);
    setIsLoading(false);
    setIsLoaded(true);
  }
  function handlePlayAudio() {
    setIsLoading(true);
    loadAudio();
  }

  useEffect(() => mediaFix(itemEmbed, embedHeight, setEmbedHeight, isLoaded));
  return (
    <div ref={itemEmbed} className="file-container">
      <FileHeader
        threadId={threadId}
        roomId={roomId}
        name={name}
        link={file !== null ? url : url || link}
        type={type}
        external
      />
      <div className="audio-container">
        {url === null && isLoading && <Spinner size="small" />}
        {url === null && !isLoading && (
          <IconButton onClick={handlePlayAudio} tooltip="Play audio" fa="fa-solid fa-circle-play" />
        )}
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
  file: null,
  type: '',
};
Audio.propTypes = {
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.string,
  file: PropTypes.shape({}),
};

function Video({
  name,
  roomId,
  threadId,
  link,
  thumbnail,
  thumbnailFile,
  thumbnailType,
  width,
  height,
  file,
  type,
  blurhash,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [url, setUrl] = useState(null);
  const [thumbUrl, setThumbUrl] = useState(null);
  const [blur, setBlur] = useState(true);

  const itemEmbed = useRef(null);
  const [embedHeight, setEmbedHeight] = useState(null);

  useEffect(() => {
    let unmounted = false;
    async function fetchUrl() {
      const myThumbUrl = await getUrl(thumbnail, thumbnailType, thumbnailFile, roomId, threadId);
      if (unmounted) return;
      setThumbUrl(myThumbUrl);
    }

    if (thumbnail !== null) fetchUrl();
    return () => {
      unmounted = true;
    };
  }, []);

  useEffect(() => mediaFix(itemEmbed, embedHeight, setEmbedHeight, isLoaded));
  const loadVideo = async () => {
    const myUrl = await getUrl(link, type, file, roomId, threadId);
    setUrl(myUrl);
    setIsLoading(false);
    setIsLoaded(true);
  };

  const handlePlayVideo = () => {
    setIsLoading(true);
    loadVideo();
  };

  return (
    <div ref={itemEmbed} className={`file-container${url !== null ? ' file-open' : ''}`}>
      <FileHeader
        threadId={threadId}
        roomId={roomId}
        name={name}
        link={file !== null ? url : url || link}
        type={type}
        external
      />
      {url === null ? (
        <div className="video-container">
          {!isLoading && (
            <IconButton
              onClick={handlePlayVideo}
              tooltip="Play video"
              fa="fa-solid fa-circle-play"
            />
          )}
          {blurhash && blur && <BlurhashCanvas hash={blurhash} punch={1} />}
          {thumbUrl !== null && (
            <img
              style={{ display: blur ? 'none' : 'unset' }}
              src={thumbUrl}
              onLoad={() => setBlur(false)}
              alt={name}
            />
          )}
          {isLoading && <Spinner size="small" />}
        </div>
      ) : (
        <div className="ratio ratio-16x9 video-base">
          <video srcwidth={width} srcheight={height} autoPlay controls poster={thumbUrl}>
            <source src={url} type={getBlobSafeMimeType(type)} />
          </video>
        </div>
      )}
    </div>
  );
}
Video.defaultProps = {
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

export { File, Image, Sticker, Audio, Video };
