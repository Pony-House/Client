import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { countObj, objType } from 'for-promise/utils/lib.mjs';

import jReact from '@mods/lib/jReact';

import * as Media from '../media/Media';
import initMatrix from '../../../client/initMatrix';
import { twemojifyReact } from '../../../util/twemojify';

import openTinyURL from '../../../util/message/urlProtection';
import { defaultAvatar } from '../../atoms/avatar/defaultAvatar';
import tinyFixScrollChat from '../media/mediaFix';
import Iframe from '../../atoms/iframe/Iframe';

const tinyUrlAction = (event) => {
  const e = event.originalEvent;
  e.preventDefault();
  openTinyURL($(event.currentTarget).attr('href'), $(event.currentTarget).attr('href'));
  return false;
};

// Embed Data
function Embed({ embed = {}, url = {}, roomId = null, threadId = null }) {
  // URL Ref
  const tinyUrl = useRef(null);
  const [useVideo, setUseVideo] = useState(false);

  const imgType =
    typeof embed['og:image:type'] === 'string' && embed['og:image:type'].length > 0
      ? embed['og:image:type'].split('/')
      : [''];

  // Add Click
  useEffect(() => {
    $(tinyUrl.current).on('click', tinyUrlAction);
    return () => {
      $(tinyUrl.current).off('click', tinyUrlAction);
    };
  });

  useEffect(() => tinyFixScrollChat());

  // Matrix
  const mx = initMatrix.matrixClient;
  const mxcUrl = initMatrix.mxcUrl;

  // Sizes
  let imgHeight =
    typeof embed['og:image:height'] === 'number'
      ? embed['og:image:height']
      : Number(embed['og:image:height']);
  let imgWidth =
    typeof embed['og:image:width'] === 'number'
      ? embed['og:image:width']
      : Number(embed['og:image:width']);

  if (Number.isNaN(imgHeight) || !Number.isFinite(imgHeight) || imgHeight < 1) imgHeight = null;

  if (Number.isNaN(imgWidth) || !Number.isFinite(imgWidth) || imgWidth < 1) imgWidth = null;

  let videoHeight =
    typeof embed['og:video:height'] === 'number'
      ? embed['og:video:height']
      : Number(embed['og:video:height']);
  let videoWidth =
    typeof embed['og:video:width'] === 'number'
      ? embed['og:video:width']
      : Number(embed['og:video:width']);
  let matrixImgSize =
    typeof embed['matrix:image:size'] === 'number'
      ? embed['matrix:image:size']
      : Number(embed['og:video:width']);

  if (Number.isNaN(videoHeight) || !Number.isFinite(videoHeight) || videoHeight < 1)
    videoHeight = null;

  if (Number.isNaN(videoWidth) || !Number.isFinite(videoWidth) || videoWidth < 1) videoWidth = null;
  if (Number.isNaN(matrixImgSize) || !Number.isFinite(matrixImgSize) || matrixImgSize < 1)
    matrixImgSize = null;

  // Video
  let videoUrl = null;
  if (typeof embed['og:video:secure_url'] === 'string' && embed['og:video:secure_url'].length > 0) {
    videoUrl = embed['og:video:secure_url'];
  } else if (typeof embed['og:video'] === 'string' && embed['og:video'].length > 0) {
    videoUrl = embed['og:video'];
  } else if (typeof embed['og:video:url'] === 'string' && embed['og:video:url'].length > 0) {
    videoUrl = embed['og:video:url'];
  }

  const videoType = typeof embed['og:video:type'] === 'string' ? embed['og:video:type'] : null;

  // Image
  let imgUrl = null;
  if (typeof embed['og:image'] === 'string' && typeof embed['og:image:secure_url'] === 'string') {
    imgUrl =
      embed['og:image:secure_url'].length > 0 ? embed['og:image:secure_url'] : embed['og:image'];
  } else if (typeof embed['og:image'] === 'string' && embed['og:image'].length > 0) {
    imgUrl = embed['og:image'];
  }

  // Article
  const articlePublisher =
    typeof embed['article:publisher'] === 'string' && embed['article:publisher'].length > 0
      ? embed['article:publisher'].trim()
      : null;

  let articleSection =
    embed['article:section'] === 'string' && embed['article:section'].length > 0
      ? embed['article:section'].trim()
      : null;

  if (articleSection) {
    while (articleSection.endsWith('\n') || articleSection.endsWith('\r')) {
      articleSection = articleSection.substring(0, articleSection.length - 1);
    }
  }

  const articleTag =
    typeof embed['article:tag'] === 'string' && embed['article:tag'].length > 0
      ? embed['article:tag'].trim()
      : null;

  // Description
  let description =
    typeof embed['og:description'] === 'string' && embed['og:description'].length > 0
      ? embed['og:description'].trim()
      : null;

  if (description) {
    while (description.endsWith('\n') || description.endsWith('\r')) {
      description = description.substring(0, description.length - 1);
    }
  }

  // Site Name
  const siteName =
    typeof embed['og:site_name'] === 'string' && embed['og:site_name'].length > 0
      ? embed['og:site_name'].trim()
      : null;

  // Embed Type
  const embedType = typeof embed['og:type'] === 'string' ? embed['og:type'] : null;

  // Title
  const title =
    typeof embed['og:title'] === 'string' && embed['og:title'].length > 0
      ? embed['og:title'].trim()
      : null;

  // Check data
  if (
    objType(embed, 'object') &&
    countObj(embed) <= 6 &&
    typeof matrixImgSize === 'number' &&
    typeof imgHeight === 'number' &&
    typeof imgWidth === 'number' &&
    typeof imgUrl &&
    imgType &&
    imgType[0] === 'image'
  ) {
    return (
      <Media.Image
        content={{
          info: { mimetype: imgType.join('/') },
          body: description ? description : imgUrl,
        }}
        roomId={roomId}
        threadId={threadId}
        width={imgWidth}
        height={imgHeight}
        link={mxcUrl.toHttp(imgUrl)}
      />
    );
  }

  // Is Thumb
  const isThumb =
    (embedType !== 'article' || embedType === 'profile') &&
    !videoUrl &&
    (typeof imgHeight !== 'number' ||
      typeof imgWidth !== 'number' ||
      (imgHeight <= 200 && imgWidth <= 200));

  // Is Video
  const isVideo = videoUrl && videoHeight && videoWidth && videoType;

  const defaultVideoAvatar = defaultAvatar(1);
  if (!imgUrl && isVideo) {
    imgUrl = defaultVideoAvatar;
  }

  let urlClick = url.href;
  if (typeof embed['og:url'] === 'string' && embed['og:url'].length > 0) urlClick = embed['og:url'];

  // Complete
  return (
    <div className="card mt-2">
      <div className="card-body">
        {isThumb && typeof imgUrl === 'string' ? (
          <span className="float-end">
            <Media.Image
              content={{ info: { mimetype: imgType.join('/') }, body: 'embed-img' }}
              maxWidth={72}
              roomId={roomId}
              threadId={threadId}
              className="embed-thumb"
              width={72}
              height={72}
              link={mxcUrl.toHttp(imgUrl, 2000, 2000)}
              linkAnim={mxcUrl.toHttp(imgUrl)}
            />
          </span>
        ) : null}

        <span>
          {siteName ? (
            <p className="card-text very-small emoji-size-fix-2 mb-2">{twemojifyReact(siteName)}</p>
          ) : null}

          {title ? (
            <h5 className="card-title small emoji-size-fix fw-bold">
              {typeof urlClick === 'string' && urlClick.length > 0 ? (
                <a ref={tinyUrl} href={urlClick} target="_blank" rel="noreferrer">
                  {twemojifyReact(title)}
                </a>
              ) : (
                title
              )}
            </h5>
          ) : null}

          {description ? (
            <p className="card-text text-freedom very-small emoji-size-fix-2">
              {twemojifyReact(description)}
            </p>
          ) : null}

          {embedType === 'article' ? (
            <>
              {articlePublisher ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(articlePublisher)}
                </p>
              ) : null}

              {articleSection ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(articleSection)}
                </p>
              ) : null}

              {articleTag ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(articleTag)}
                </p>
              ) : null}
            </>
          ) : null}

          {!isVideo && !isThumb && typeof imgUrl === 'string' && imgUrl.length > 0 ? (
            <Media.Image
              content={{ info: { mimetype: imgType.join('/') }, body: 'embed-img' }}
              maxWidth={350}
              roomId={roomId}
              threadId={threadId}
              className="mt-3 embed-img"
              width={imgWidth}
              height={imgHeight}
              link={mxcUrl.toHttp(imgUrl, 2000, 2000)}
              linkAnim={mxcUrl.toHttp(imgUrl)}
            />
          ) : null}

          {isVideo && typeof imgUrl === 'string' && imgUrl.length > 0 ? (
            !useVideo ? (
              <div
                className="mt-2 ratio ratio-16x9 embed-video"
                style={{
                  backgroundImage: `url('${imgUrl !== defaultVideoAvatar ? mxcUrl.toHttp(imgUrl, 2000, 2000) : defaultVideoAvatar}')`,
                }}
                onClick={() => {
                  setUseVideo(true);
                }}
              >
                <div
                  className="play-button w-100 h-100"
                  style={{ backgroundImage: `url('./img/svg/play-circle-fill.svg')` }}
                />
              </div>
            ) : (
              <div className="mt-2 ratio ratio-16x9 embed-video enabled">
                <Iframe title={title} src={videoUrl} allowFullScreen frameBorder={0} />
              </div>
            )
          ) : null}
        </span>
      </div>
    </div>
  );
}

// Message Default Data
Embed.propTypes = {
  embed: PropTypes.object,
  url: PropTypes.object,
  roomId: PropTypes.string,
  threadId: PropTypes.string,
};

export default Embed;
