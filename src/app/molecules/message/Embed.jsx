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
      : null;

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

  // Image
  let imgUrl = null;
  if (typeof embed['og:image'] === 'string' && typeof embed['og:image:secure_url'] === 'string') {
    imgUrl =
      embed['og:image:secure_url'].length > 0 ? embed['og:image:secure_url'] : embed['og:image'];
  } else if (typeof embed['og:image'] === 'string' && embed['og:image'].length > 0) {
    imgUrl = embed['og:image'];
  }

  if (
    objType(embed, 'object') &&
    countObj(embed) <= 6 &&
    typeof embed['matrix:image:size'] === 'number' &&
    typeof embed['og:image:height'] === 'number' &&
    typeof embed['og:image:width'] === 'number' &&
    typeof imgUrl &&
    imgType &&
    imgType[0] === 'image'
  ) {
    return (
      <Media.Image
        content={{
          info: { mimetype: String(embed['og:image:type']) },
          body:
            typeof embed['og:description'] === 'string' && embed['og:description'].length > 0
              ? embed['og:description']
              : embed['og:image'],
        }}
        roomId={roomId}
        threadId={threadId}
        width={embed['og:image:width']}
        height={embed['og:image:height']}
        link={mxcUrl.toHttp(imgUrl)}
      />
    );
  }

  // Is Thumb
  const isThumb =
    (embed['og:type'] !== 'article' || embed['og:type'] === 'profile') &&
    !embed['og:video:url'] &&
    !embed['og:video'] &&
    !embed['og:video:secure_url'] &&
    (typeof embed['og:image:height'] !== 'number' ||
      typeof embed['og:image:width'] !== 'number' ||
      (embed['og:image:height'] <= 200 && embed['og:image:width'] <= 200));

  // Video
  let videoUrl = null;
  if (typeof embed['og:video:secure_url'] === 'string' && embed['og:video:secure_url'].length > 0) {
    videoUrl = embed['og:video:secure_url'];
  } else if (typeof embed['og:video'] === 'string' && embed['og:video'].length > 0) {
    videoUrl = embed['og:video'];
  } else if (typeof embed['og:video:url'] === 'string' && embed['og:video:url'].length > 0) {
    videoUrl = embed['og:video:url'];
  }

  // Is Video
  const isVideo =
    videoUrl &&
    typeof embed['og:video:height'] &&
    typeof embed['og:video:width'] &&
    embed['og:video:type'];

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
              content={{ info: { mimetype: String(embed['og:image:type']) }, body: 'embed-img' }}
              maxWidth={72}
              roomId={roomId}
              threadId={threadId}
              className="embed-thumb"
              width={Number(embed['og:image:width'])}
              height={Number(embed['og:image:height'])}
              link={mxcUrl.toHttp(imgUrl, 2000, 2000)}
              linkAnim={mxcUrl.toHttp(imgUrl)}
            />
          </span>
        ) : null}

        <span>
          {typeof embed['og:site_name'] === 'string' && embed['og:site_name'].length > 0 ? (
            <p className="card-text very-small emoji-size-fix-2 mb-2">
              {twemojifyReact(embed['og:site_name'])}
            </p>
          ) : null}

          {typeof embed['og:title'] === 'string' && embed['og:title'].length > 0 ? (
            <h5 className="card-title small emoji-size-fix fw-bold">
              {typeof urlClick === 'string' && urlClick.length > 0 ? (
                <a ref={tinyUrl} href={urlClick} target="_blank" rel="noreferrer">
                  {twemojifyReact(embed['og:title'])}
                </a>
              ) : (
                embed['og:title']
              )}
            </h5>
          ) : null}

          {isThumb &&
          typeof embed['og:description'] === 'string' &&
          embed['og:description'].length > 0 ? (
            <p className="card-text text-freedom very-small emoji-size-fix-2">
              {twemojifyReact(embed['og:description'])}
            </p>
          ) : null}

          {embed['og:type'] === 'article' ? (
            <>
              {typeof embed['article:publisher'] === 'string' &&
              embed['article:publisher'].length > 0 ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(embed['article:publisher'])}
                </p>
              ) : null}

              {typeof embed['article:section'] === 'string' &&
              embed['article:section'].length > 0 ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(embed['article:section'])}
                </p>
              ) : null}

              {typeof embed['article:tag'] === 'string' && embed['article:tag'].length > 0 ? (
                <p className="card-text very-small emoji-size-fix-2 mt-2">
                  {twemojifyReact(embed['article:tag'])}
                </p>
              ) : null}
            </>
          ) : null}

          {!isVideo && !isThumb && typeof imgUrl === 'string' && imgUrl.length > 0 ? (
            <Media.Image
              content={{ info: { mimetype: String(embed['og:image:type']) }, body: 'embed-img' }}
              maxWidth={350}
              roomId={roomId}
              threadId={threadId}
              className="mt-3 embed-img"
              width={Number(embed['og:image:width'])}
              height={Number(embed['og:image:height'])}
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
                <Iframe
                  title={String(embed['og:title'])}
                  src={videoUrl}
                  allowFullScreen
                  frameBorder={0}
                />
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
