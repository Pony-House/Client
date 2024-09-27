import React from 'react';
import PropTypes from 'prop-types';

export const audioFormats = ['audio/mpeg', 'audio/ogg', 'audio/wav'];

const AudioEmbed = React.forwardRef(
  (
    {
      id = null,
      className = null,
      autoPlay = false,
      autoBuffer = false,
      controls = false,
      loop = false,
      muted = false,
      preload = null,
      style = null,
      src = null,
      track = null,
      type = null,
      notSupportedMessage = null,
    },
    ref,
  ) => {
    return (
      <audio
        id={id}
        style={style}
        src={typeof src === 'string' ? src : null}
        autoPlay={autoPlay}
        autobuffer={autoBuffer}
        controls={controls}
        loop={loop}
        muted={muted}
        preload={preload}
        ref={ref}
        className={className}
        type={typeof type === 'string' && audioFormats.indexOf(type) > -1 ? type : null}
      >
        {Array.isArray(src)
          ? src.map((item) => (
              <source
                key={`AudioSrcEmbed:${item.src}:${item.type}`}
                src={typeof item.src === 'string' ? item.src : null}
                type={
                  typeof item.type === 'string' && audioFormats.indexOf(item.type) > -1
                    ? item.type
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
      </audio>
    );
  },
);

AudioEmbed.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  notSupportedMessage: PropTypes.string,
  autoPlay: PropTypes.bool,
  autoBuffer: PropTypes.bool,
  controls: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  preload: PropTypes.string,
  track: PropTypes.array,
  style: PropTypes.object,
  type: PropTypes.string,
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default AudioEmbed;
