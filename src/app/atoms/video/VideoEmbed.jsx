import React from 'react';
import PropTypes from 'prop-types';

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
      notSupportMessage = null,
      poster = null,
      track = null,
      type = null,
    },
    ref,
  ) => {
    return (
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
        ref={ref}
        className={className}
        playsInline={playsInline}
        type={type}
      >
        {Array.isArray(src)
          ? src.map((item) => (
              <source
                key={`VideoSrcEmbed:${item.url}:${item.type}`}
                src={typeof item.url === 'string' ? item.url : null}
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
                key={`AudioTrackEmbed:${item.url}:${item.type}`}
                src={typeof item.url === 'string' ? item.url : null}
                kind={typeof item.kind === 'string' ? item.kind : null}
                label={typeof item.label === 'string' ? item.label : null}
              />
            ))
          : null}
        {notSupportMessage}
      </video>
    );
  },
);

VideoEmbed.propTypes = {
  notSupportMessage: PropTypes.string,
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
