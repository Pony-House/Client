import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Player from './player';

const AudioEmbed = React.forwardRef(
  (
    {
      onTimeUpdate,
      onLoad,
      onPlay,
      onPause,
      onEnd,

      loadingText,
      preparingComp,
      speedPanel,

      profile,

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
      <Player
        id={id}
        style={style}
        src={typeof src === 'string' ? [src] : Array.isArray(src) ? src : null}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onTimeUpdate={onTimeUpdate}
        onLoad={onLoad}
        onPlay={onPlay}
        onPause={onPause}
        onEnd={onEnd}
        profile={profile}
        loadingText={loadingText}
        preparingComp={preparingComp}
        speedPanel={speedPanel}
      />
    );

    /* return (
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
                            ); */
  },
);

AudioEmbed.propTypes = {
  onTimeUpdate: PropTypes.func,
  onLoad: PropTypes.func,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onEnd: PropTypes.func,

  loadingText: PropTypes.func,
  preparingComp: PropTypes.node,
  speedPanel: PropTypes.string,
  profile: PropTypes.string,

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
