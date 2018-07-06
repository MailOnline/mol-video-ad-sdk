import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ResponsiveVideoAd} from '../index';
import styles from './styles.css';

class Player extends Component {
  static defaultProps = {
    autoplay: false,
    // eslint-disable-next-line no-console
    logger: (namespace) => (...args) => console.log(namespace, ...args)
  };

  static propTypes = {
    adTag: PropTypes.string.isRequired,
    autoplay: PropTypes.bool,
    logger: PropTypes.func,
    poster: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired
  };

  state = {
    adFinished: false,
    loading: false,
    started: false
  }

  constructor (props) {
    super(props);

    this.videoElement = React.createRef();
    this.handleStart = this.handleStart.bind(this);
    this.handleAdFinish = this.handleAdFinish.bind(this);
  }

  handleStart () {
    // eslint-disable-next-line react/no-set-state
    this.setState({
      ...this.state,
      started: true
    });
  }

  handleAdFinish () {
    // eslint-disable-next-line react/no-set-state
    this.setState({
      ...this.state,
      adFinished: true
    });

    this.videoElement.current.src = this.props.source;
    this.videoElement.current.play();
  }

  render () {
    const {
      adTag,
      autoplay,
      logger,
      poster,
      source
    } = this.props;

    const {
      adFinished,
      loading,
      started
    } = this.state;

    const skipBtn = document.createElement('button');

    skipBtn.classList.add(styles.skipControl);
    skipBtn.innerHTML = 'Skip';

    return <div className={styles.videoContainer}>
      <video
        autoPlay={autoplay}
        className={styles.videoElement}
        controls={true}
        muted={autoplay}
        ref={this.videoElement}
      >
        <source src={source} type='video/mp4' />
      </video>
      {started && !adFinished &&
        <div className={styles.adContainer} >
          <ResponsiveVideoAd
            getTag={() => adTag}
            onFinish={this.handleAdFinish}
            onLinearEvent={(eventname, ...args) => logger(eventname)(...args)}
            onNonRecoverableError={logger('NonRecoverableError')}
            onRecoverableError={logger('RecoverableError')}
            onStart={logger('start')}
            skipControl={skipBtn}
            tracker={logger('Tracking')}
            videoElement={this.videoElement.current}
          />
        </div>
      }
      {loading && <div className={styles.loading} />}
      {!started &&
        <div className={styles.cover} onClick={this.handleStart}>
          <img className={styles.poster} src={poster} />
          <div className={styles.bigPlayBtn} />
        </div>
      }
    </div>;
  }
}

export default Player;
