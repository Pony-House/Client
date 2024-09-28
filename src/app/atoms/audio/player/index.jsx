/* eslint-disable max-len */
// Credits https://github.com/binodswain/react-howler-player
import React, { Component, Fragment } from 'react';
import { Howl } from 'howler';
import PropTypes from 'prop-types';
import { isEqual, renderSVGicons } from './func';
import Prepare from './prepare';
import keyboardEvents from './events';
import './styles.scss';
import './profile.scss';

export const audioFormats = [
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/mp3',
  'audio/flac',
  'audio/aac',
];

const STATE = {
  PREPARE: 'PREPARE',
  READY: 'READY',
  ENDED: 'ENDED',
  PAUSE: 'PAUSE',
  PLAYING: 'PLAYING',
};

// audio playback speed
const rateOptions = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

class PlayerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sound: null,
      playerState: STATE.PREPARE,
      src: [],
      progressValue: 0,
      currentPos: '0:00',
      volume: 70,
      isMute: false,

      isSettingsOpen: false,
      rate: 1,
      ratePanel: false,
    };
    this.rateRef = React.createRef();
    this.rateDivRef = React.createRef();
  }

  stepInterval = null;

  ref = React.createRef();

  toggleMute = () => {
    this.setState((prevState) => {
      const { volume, sound } = prevState;

      if (volume == 0 || !prevState.isMute) {
        sound.mute(true);
        return { isMute: true };
      }
      sound.mute(false);
      return { isMute: !prevState.isMute };
    });
  };

  readyToPlay = () => {
    const { playerState, sound } = this.state;
    const { onLoad, autoPlay = false, mute = false } = this.props;

    if (playerState === STATE.PLAYING) {
      return;
    }

    const meta = {
      duration: Math.round(sound.duration()),
      volume: sound.volume(),
      audio: sound,
    };

    if (mute) this.changeVolume(0);
    if (autoPlay) this.playbackPlay();

    this.setState(
      {
        playerState: STATE.READY,
        duration: this.formatTime(Math.round(sound.duration())),
      },
      onLoad && typeof onLoad === 'function' ? () => onLoad(meta) : undefined,
    );
  };

  setupPlayer = () => {
    this.destroySound();
    const {
      src,
      format = audioFormats.map((item) => item.split('/')[1]),
      onPlay,
      onPause,
      onEnd,
      loop,
    } = this.props;

    if (!src) {
      return;
    }
    const sound = new Howl({
      src,
      format,
      html5: true,
    });

    sound.once('load', this.readyToPlay);

    sound.on('end', () => {
      this.playbackEnded();

      // Loop
      if (loop) {
        this.playbackPlay();
        return;
      }

      // onEnd prop
      onEnd && onEnd();
    });

    sound.on('play', () => {
      this.stepInterval = setInterval(this.step, 15);

      // onPlay prop
      onPlay && onPlay();
    });

    sound.on('pause', () => {
      // pause
      this.playbackPause();

      // onPause prop
      onPause && onPause();
    });

    sound.on('stop', () => {
      this.setState({
        playerState: STATE.ENDED,
        progressValue: 0,
        currentPos: '0:00',
      });
    });

    this.setState({
      sound,
      playerState: STATE.PREPARE,
      progressValue: 0,
      currentPos: '0:00',
      src,
    });
  };

  playbackEnded = () => {
    const { onTimeUpdate } = this.props;
    const { duration } = this.state;

    if (onTimeUpdate) {
      const playerState = {
        currentTime: this.state.sound.duration(),
        progressPercent: 100,
      };
      onTimeUpdate(playerState);
    }
    clearInterval(this.stepInterval);
    this.setState({
      playerState: STATE.ENDED,
      progressValue: 100,
      currentPos: duration,
    });
  };

  playbackPlay = () => {
    const { sound } = this.state;
    sound.play();
    this.setState({
      playerState: STATE.PLAYING,
    });
  };

  playbackPause = () => {
    const { sound } = this.state;
    if (sound.playing()) {
      sound.pause();
    }
    clearInterval(this.stepInterval);
    this.setState({
      playerState: STATE.PAUSE,
    });
  };

  componentDidMount() {
    this.setupPlayer();
    this.addResizeListener();
  }

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime = (secs) => {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = secs - minutes * 60 || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  /**
   * Seek to a new position in the currently playing track.
   * @variable  {Number} per Percentage through the song to skip.
   */
  seek = (e) => {
    const { sound } = this.state;
    const per = e.target.value / 100;
    sound.seek(sound.duration() * per);
    const seek = sound.seek() || 0;
    this.setState({
      progressValue: e.target.value,
      currentPos: this.formatTime(Math.round(seek)),
    });
  };

  step = () => {
    const { sound } = this.state;
    const { onTimeUpdate } = this.props;

    const seek = sound.seek() || 0;

    const percentage = (seek / sound.duration()) * 100 || 0;

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      this.setState({
        progressValue: percentage.toFixed(3),
        currentPos: this.formatTime(Math.round(seek)),
        playerState: STATE.PLAYING,
      });
      if (onTimeUpdate) {
        const playerState = {
          currentTime: seek,
          progressPercent: Number(percentage.toFixed(3)),
        };
        onTimeUpdate(playerState);
      }
    }
  };

  changeVolume = (volume) => {
    this.state.sound.volume(Math.round(volume) / 100);

    this.setState({
      volume,
      isMute: Number(volume) === 0,
    });
  };

  volumeUp = () => {
    this.setState((prevState) => {
      let volume = prevState.volume;
      volume += 5;
      if (volume > 100) {
        volume = 100;
      }
      this.state.sound.volume(Math.round(volume) / 100);
      return { volume, isMute: false };
    });
  };

  volumeDown = () => {
    this.setState((prevState) => {
      let volume = prevState.volume;
      let isMute = prevState.isMute;
      volume -= 5;
      if (volume < 0) {
        volume = 0;
        isMute = true;
      }
      this.state.sound.volume(Math.round(volume) / 100);
      return {
        volume,
        isMute,
      };
    });
  };

  seekForward = () => {
    const { sound } = this.state;
    const currentPos = sound.seek();
    const duration = sound.duration();
    let forward = duration / 20 < 10 ? 10 : duration / 20;
    if (currentPos + forward > duration) {
      return;
    }

    if (duration - currentPos < forward && forward > 50) {
      forward = 10;
    }
    sound.seek(currentPos + forward);
    const percentage = ((currentPos + forward) / sound.duration()) * 100 || 0;
    this.setState({
      progressValue: Math.round(percentage),
      currentPos: this.formatTime(Math.round(currentPos + forward)),
    });
  };

  seekBackward = () => {
    const { sound } = this.state;
    const currentPos = sound.seek();
    const duration = sound.duration();
    let backward = duration / 20 < 10 ? 10 : duration / 20;
    if (currentPos - backward < 0) {
      return;
    }

    if (currentPos < backward && backward > 50) {
      backward = 10;
    }
    sound.seek(currentPos - backward);

    const percentage = ((currentPos - backward) / sound.duration()) * 100 || 0;
    this.setState({
      progressValue: Math.round(percentage),
      currentPos: this.formatTime(Math.round(currentPos - backward)),
    });
  };

  keyPress = (event) => {
    const { sound, playerState, isMute } = this.state;
    const code = event.keyCode ? event.keyCode : event.which;

    if (keyboardEvents.keyCodes[code] === 'tab') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const focusedEle = document.activeElement;

    switch (keyboardEvents.keyCodes[code]) {
      case 'space':
      case 'return':
        if (focusedEle.name === 'volume') {
          if (isMute) {
            sound.mute(false);
          } else {
            sound.mute(true);
          }
          this.setState({ isMute: !this.state.isMute });
          break;
        }
        if (playerState === STATE.PLAYING) {
          sound.pause();
          this.setState({ playerState: STATE.PAUSE });
        } else if (
          playerState === STATE.READY ||
          playerState === STATE.PAUSE ||
          playerState === STATE.ENDED
        ) {
          sound.play();
          this.setState({ playerState: STATE.PLAYING });
        }
        break;
      case 'm':
        if (isMute) {
          sound.mute(false);
        } else {
          sound.mute(true);
        }
        this.setState({ isMute: !this.state.isMute });
        break;
      case 'arrowUp':
        this.volumeUp();
        break;
      case 'arrowDown':
        this.volumeDown();
        break;
      case 'arrowRight':
        this.seekForward();
        break;
      case 'arrowLeft':
        this.seekBackward();
        break;
      case 'tab':
        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    this.destroySound();
    this.removeResizeListener();
  }

  setVolumePosition = () => {
    const { rate, ratePanel } = this.state;
    if (!ratePanel) {
      return;
    }

    const {
      speedPanel = 'relative', // 'top', 'bottom', 'relative'
    } = this.props;

    const { current: rateOlEle } = this.rateRef;
    const { current: rateDivEle } = this.rateDivRef;

    const rect = rateDivEle.getBoundingClientRect();
    const rectOl = rateOlEle.getBoundingClientRect();

    const { left, top, right } = rect;
    const { height } = rectOl;

    const listItemHeight = height / rateOptions.length;

    if (speedPanel === 'relative') {
      const selectedIndex = rateOptions.indexOf(rate);

      rateOlEle.style.left = `${right - 40}px`;
      rateOlEle.style.top = `${top - listItemHeight * selectedIndex + 2.5}px`;
    } else if (speedPanel === 'top') {
      rateOlEle.style.left = `${right - 40}px`;
      rateOlEle.style.top = `${top - height + listItemHeight + 11}px`;
    } else if (speedPanel === 'bottom') {
      rateOlEle.style.left = `${right - 40}px`;
      rateOlEle.style.top = `${top - 9}px`;
    }
  };

  addResizeListener = () => {
    window.addEventListener('resize', () => {
      this.setVolumePosition();
    });
  };

  removeResizeListener = () => {
    window.addEventListener('resize', function () {
      this.setVolumePosition();
    });
  };

  destroySound = () => {
    const { sound } = this.state;
    clearInterval(this.stepInterval);
    if (sound) {
      sound.off();
      sound.stop();
    }
  };

  UNSAFE_componentWillReceiveProps(props) {
    const { src } = this.state;

    if (!isEqual(src, props.src)) {
      this.setupPlayer();
    }
  }

  toggleSettingsPanel = (flag) => {
    this.setState({
      isSettingsOpen: flag,
    });
  };

  setRate = (rate, cb) => {
    const { sound } = this.state;
    this.setState(
      {
        rate,
      },
      () => {
        if (cb) {
          cb();
        }
        sound.rate(rate);
      },
    );
  };

  toogleRatePanel = (flag) => {
    this.setState(
      {
        ratePanel: flag,
      },
      this.setVolumePosition,
    );
  };

  render() {
    const { playerState, progressValue, duration, currentPos, volume, isMute, ratePanel } =
      this.state;

    const { profile = 'generic' } = this.props;

    if (playerState === STATE.PREPARE) {
      return <Prepare {...this.props} />;
    }

    const className = ['player', 'r-howler'].join(' ');

    let btnFunction = undefined;
    let btnAttrs = {};

    if (playerState === STATE.READY || playerState === STATE.PAUSE || playerState === STATE.ENDED) {
      btnFunction = this.playbackPlay;
      btnAttrs = {
        'aria-label': 'Play',
        id: 'rh-player-play',
      };
    } else if (playerState === STATE.PLAYING) {
      btnFunction = this.playbackPause;
      btnAttrs = {
        'aria-label': 'Pause',
        id: 'rh-player-pause',
      };
    }

    const currentPosRound = Math.round(progressValue);
    const playbackControl = (
      <button type="button" {...btnAttrs} onClick={btnFunction}>
        <svg role="presentation" className={'icon'}>
          <use xlinkHref={playerState === STATE.PLAYING ? '#r-howl-pause' : '#r-howl-play'}></use>
        </svg>
      </button>
    );
    const progressBar = (
      <div className={'progress-bar'}>
        <input
          type="range"
          id="rh-player-media-progress"
          className={'player-progress'}
          step="0.01"
          min="0"
          max="100"
          value={progressValue}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={currentPosRound}
          aria-valuetext={`${currentPos} of ${duration}, ${currentPosRound} percentage complete`}
          role="slider"
          style={{
            '--progress-value': `${progressValue}%`,
          }}
          autoComplete="off"
          onChange={this.seek}
        />
      </div>
    );
    const audiodurationControls = (
      <div className={'audio-duration'}>
        {currentPos} <span className={'duration'}>/ {duration || '...'}</span>
      </div>
    );
    const volumeControls = (
      <div className={'volume-control'}>
        <button
          type="button"
          onClick={this.toggleMute}
          id="rh-player-volume"
          name="volume"
          aria-label={isMute ? 'Unmute' : 'Mute'}
        >
          <svg role="presentation" className={'icon'}>
            <use xlinkHref={isMute ? '#r-howl-muted' : '#r-howl-volume'}></use>
          </svg>
        </button>
        <input
          type="range"
          id="rh-player-volume-slider"
          className={'audio-bar'}
          style={{
            '--progress-value': `${isMute ? 0 : volume}%`,
          }}
          min="0"
          max="100"
          step="0.01"
          value={isMute ? 0 : volume}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={isMute ? 0 : volume}
          role="slider"
          aria-label="volume"
          aria-valuetext={isMute ? 'Muted' : `${volume}%`}
          onChange={(e) => {
            this.changeVolume(e.target.value);
          }}
        />
      </div>
    );
    const playbackRateList = (
      <div className={'player-speed'} ref={this.rateDivRef}>
        <button
          className={['player-rate-btn', ratePanel ? 'rate-btn-hidden' : '']
            .filter(Boolean)
            .join(' ')}
          hidden={ratePanel}
          onClick={() => this.toogleRatePanel(true)}
          type="button"
        >
          {this.state.rate} x
        </button>
        <ol
          hidden={!ratePanel}
          ref={this.rateRef}
          className="list-group unstyled p-0 m-0"
          style={{
            height: '115px',
            overflowY: 'auto',
          }}
        >
          {rateOptions.map((rate, index) => {
            const selected = rate == this.state.rate;
            const attr = {};
            if (selected) {
              attr.className = 'selected-option';
            }
            return (
              <li
                {...attr}
                key={index}
                onClick={() => this.setRate(rate, () => this.toogleRatePanel(false))}
              >
                {rate}
                <span aria-hidden="true">x</span>
              </li>
            );
          })}
        </ol>
      </div>
    );

    let markup = '';
    if (profile === 'top_progress') {
      markup = (
        <Fragment>
          <div
            className={`profile_${profile}`}
            style={{
              '--progressbar-radius': 0,
            }}
          >
            {progressBar}
            <div className={'player-controls'}>
              <div className={'left-controls'}>
                {playbackControl}
                {/* {forwardControl} */}
                {/* {replayControl} */}
              </div>
              {audiodurationControls}
              {volumeControls}
            </div>
          </div>
        </Fragment>
      );
    } else if (profile === 'generic') {
      markup = (
        <Fragment>
          <div className={`profile_${profile}`}>
            <div className={'player-controls'}>
              <div className={'left-controls'}>
                {playbackControl}
                {/* {forwardControl} */}
                {/* {replayControl} */}
              </div>
              {progressBar}
              {audiodurationControls}
              {volumeControls}
              {playbackRateList}
            </div>
          </div>
        </Fragment>
      );
    } else if (profile === 'minimal') {
      markup = (
        <div className={`profile_${profile}`}>
          <div className={'player-controls'}>
            <div className={'left-controls'}>
              {/* {forwardControl} */}
              {playbackControl}
              {/* {replayControl} */}
            </div>
            {/* {progressBar} */}
            {audiodurationControls}
            {/* {volumeControls} */}
          </div>
        </div>
      );
    }

    return (
      <div
        className={className}
        onKeyPress={(e) => this.keyPress(e)}
        onKeyDown={(e) => this.keyPress(e)}
        id="rh-player-main"
        ref={this.ref}
      >
        {renderSVGicons()}
        {markup}
      </div>
    );
  }
}

PlayerComponent.propTypes = {
  src: PropTypes.array.isRequired,
  format: PropTypes.array,
  loadingText: PropTypes.string,
  onTimeUpdate: PropTypes.func,
  onEnd: PropTypes.func,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  speedPanel: PropTypes.string,
  onLoad: PropTypes.func,
  profile: PropTypes.oneOf(['generic', 'minimal', 'top_progress']),
};

export default PlayerComponent;
