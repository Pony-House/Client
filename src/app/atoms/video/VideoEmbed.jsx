import React, { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';

import videojs from 'video.js';
import { isMobile } from '@src/util/libs/mobile';

export const videoFormats = [
  'video/ogg',
  'video/avi',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const VideoEmbed = React.forwardRef(
  (
    {
      onClick = null,
      onReady = null,
      enableSmoothSeeking = false,
      aspectRatioX = 16,
      aspectRatioY = 9,
      fullscreen = null,
      language = 'en',
      fluid = false,
      responsive = false,
      inactivityTimeout = 0,
      liveUi = false,
      languages = null,
      nativeControlsForTouch = isMobile(),

      noUITitleAttributes = false,
      playbackRates = null,
      plugins = null,
      preferFullWindow = false,
      skipButtons = null,
      suppressNotSupportedError = null,

      techCanOverridePoster = null,
      techOrder = ['html5'],

      liveTracker = {
        trackingThreshold: 20,
        liveTolerance: 15,
      },

      playsInline = false,
      id = null,
      className = null,
      autoPlay = false,
      autoBuffer = false,
      controls = false,
      loop = false,
      muted = false,
      preload = null,
      src = null,
      crossOrigin = null,
      controlsList = null,
      disablePictureInPicture = false,
      disableRemotePlayback = false,
      height = null,
      width = null,
      style = null,
      notSupportedMessage = null,
      poster = null,
      track = null,
      type = null,
    },
    ref,
  ) => {
    const [, forceUpdate] = useReducer((count) => count + 1, 0);
    const playerRef = useRef(null);
    const videoRef = ref || useRef(null);
    const resetPlayer = () => {
      playerRef.current = null;
      forceUpdate();
    };

    useEffect(() => {
      // Make sure Video.js player is only initialized once
      if (!playerRef.current) {
        // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
        const videoElement = document.createElement('video-js');

        videoElement.classList.add('vjs-big-play-centered');
        videoRef.current.appendChild(videoElement);

        const options = {
          autoplay: autoPlay,
          playsinline: playsInline,
          preferFullWindow,
          plugins,
          responsive,
          skipButtons,
          suppressNotSupportedError,
          techCanOverridePoster,
          techOrder,
          fluid,
          sources: Array.isArray(src)
            ? src
            : typeof src === 'string' && typeof type === 'string'
              ? [
                  {
                    src: src,
                    type: type,
                  },
                ]
              : null,
          src: typeof src === 'string' && typeof type !== 'string' ? src : null,
          aspectRatio: `${aspectRatioX}:${aspectRatioY}`,
          audioOnlyMode: false,
          audioPosterMode: false,
          liveui: liveUi,
          disablePictureInPicture: disablePictureInPicture,
          fullscreen,
          controls,
          height,
          width,
          loop,
          muted,
          poster,
          preload,
          id,
          language,
          enableSmoothSeeking,
          inactivityTimeout,
          nativeControlsForTouch,
          notSupportedMessage,
          noUITitleAttributes,
          languages,
          liveTracker,
          playbackRates,
        };

        for (const item in options) {
          if (typeof options[item] === 'undefined' || options[item] === null) delete options[item];
        }

        const player = (playerRef.current = videojs(videoElement, options, () => {
          // videojs.log('player is ready');
          onReady && onReady(player, resetPlayer);
        }));

        // You could update an existing player in the `else` block here
        // on prop change, for example:
      } else {
        const player = playerRef.current;
        if (player) {
          player.autoplay(autoPlay);
          player.src(src);
        }
      }
    }, [videoRef]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
      const player = playerRef.current;

      return () => {
        if (player && !player.isDisposed()) {
          player.dispose();
          resetPlayer();
        }
      };
    }, [playerRef]);

    return (
      <div
        data-vjs-player
        className={`data-vjs-player-container${className ? ` ${className}` : ''}`}
        onClick={onClick}
      >
        <div ref={videoRef} />
      </div>
    );

    /* return (
      <video
        id={id}
        poster={poster}
        src={typeof src === 'string' ? src : null}
        height={height || (style && typeof style.height === 'number' ? style.height : null)}
        width={width || (style && typeof style.width === 'number' ? style.width : null)}
        style={style}
        autoPlay={autoPlay}
        controls={controls}
        disablePictureInPicture={__ENV_APP__.ELECTRON_MODE || disablePictureInPicture}
        disableRemotePlayback={disableRemotePlayback}
        controlsList={
          typeof controlsList === 'string'
            ? controlsList
            : Array.isArray(controlsList)
              ? controlsList.join(',')
              : null
        }
        crossOrigin={crossOrigin}
        loop={loop}
        muted={muted}
        preload={preload}
        ref={videoRef}
        className={className}
        playsInline={playsInline}
        type={typeof type === 'string' && videoFormats.indexOf(type) > -1 ? type : null}
      >
        {Array.isArray(src)
          ? src.map((item) => (
            <source
              key={`VideoSrcEmbed:${item.src}:${item.type}`}
              src={typeof item.src === 'string' ? item.src : null}
              type={
                typeof item.type === 'string' && videoFormats.indexOf(item.type) > -1
                  ? `${item.type}${typeof item.codecs === 'string' ? `; codecs${item.codecs !== '*' ? `="${encodeURI(codecs)}"` : '*'}` : ''}`
                  : null
              }
            />
          ))
          : null}
        {Array.isArray(track)
          ? track.map((item) => (
            <track
              key={`AudioTrackEmbed:${item.src}:${item.type}`}
              src={typeof item.src === 'string' ? item.src : null}
              kind={typeof item.kind === 'string' ? item.kind : null}
              label={typeof item.label === 'string' ? item.label : null}
            />
          ))
          : null}
        {notSupportedMessage}
      </video>
    ); */
  },
);

VideoEmbed.propTypes = {
  onClick: PropTypes.func,
  playbackRates: PropTypes.array,
  plugins: PropTypes.object,
  fullscreen: PropTypes.object,
  aspectRatioX: PropTypes.number,
  aspectRatioY: PropTypes.number,
  language: PropTypes.string,
  enableSmoothSeeking: PropTypes.bool,
  fluid: PropTypes.bool,
  responsive: PropTypes.bool,
  inactivityTimeout: PropTypes.number,
  languages: PropTypes.object,
  liveTracker: PropTypes.object,
  liveUi: PropTypes.bool,
  nativeControlsForTouch: PropTypes.bool,
  noUITitleAttributes: PropTypes.bool,
  preferFullWindow: PropTypes.bool,
  skipButtons: PropTypes.object,
  suppressNotSupportedError: PropTypes.bool,
  techCanOverridePoster: PropTypes.bool,
  techOrder: PropTypes.array,

  onReady: PropTypes.func,
  notSupportedMessage: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  poster: PropTypes.string,
  autoPlay: PropTypes.bool,
  controls: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  playsInline: PropTypes.bool,
  disablePictureInPicture: PropTypes.bool,
  disableRemotePlayback: PropTypes.bool,
  style: PropTypes.object,
  preload: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  crossOrigin: PropTypes.string,
  type: PropTypes.string,
  track: PropTypes.array,
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  controlsList: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default VideoEmbed;
