/* eslint-disable filenames/match-exported */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {runWaterfall} from '@mol/video-ad-sdk';
import makeCancelable from './helpers/makeCancelable';

const noop = () => {};

class VideoAd extends Component {
  static defaultProps = {
    children: undefined,
    height: undefined,
    logger: console,
    onError: noop,
    onFinish: noop,
    onStart: noop,
    skipControl: undefined,
    tracker: undefined,
    videoElement: undefined,
    width: undefined
  };

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.any),
      PropTypes.any
    ]),
    getTag: PropTypes.func.isRequired,
    height: PropTypes.number,
    logger: PropTypes.shape({
      error: PropTypes.func,
      log: PropTypes.func
    }),
    onError: PropTypes.func,
    onFinish: PropTypes.func,
    onStart: PropTypes.func,
    skipControl: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.any
    ]),
    tracker: PropTypes.func,
    videoElement: PropTypes.any,
    width: PropTypes.number
  };

  constructor (props) {
    super(props);

    this.videoAdPlaceholder = React.createRef();
  }

  state = {
    ready: false
  };

  componentDidMount () {
    this.adUnitPromise = this.startAd();
    this.stateUpdate = makeCancelable(this.adUnitPromise);
    // eslint-disable-next-line promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    this.stateUpdate.promise.then((adUnit) => {
      this.adUnit = adUnit;

      // eslint-disable-next-line react/no-set-state
      this.setState({
        ready: true
      });
    });
  }

  componentWillUnmount () {
    if (this.stateUpdate.isPending()) {
      this.stateUpdate.cancel();
    }
    const adUnit = this.adUnit;

    if (adUnit && !adUnit.isFinished()) {
      adUnit.cancel();
    }
  }

  componentDidUpdate (prevProps) {
    const {
      height,
      width,
      onStart
    } = this.props;

    const adUnit = this.adUnit;

    if (this.state.ready && adUnit) {
      if (height !== prevProps.height || width !== prevProps.width && !adUnit.isFinished()) {
        adUnit.resize();
      }

      onStart({
        adUnit,
        pause: () => adUnit.pause(),
        resume: () => adUnit.resume(),
        setVolume: (newVolume) => adUnit.setVolume(newVolume)
      });
    }
  }

  async startAd () {
    const {
      getTag,
      logger,
      onFinish,
      onError,
      skipControl,
      tracker,
      videoElement
    } = this.props;

    const onRecoverableError = (error) => {
      error.isRecoverable = true;
      onError(error);
    };

    const onNonRecoverableError = (error) => {
      error.isRecoverable = false;
      onError(error);
    };

    const options = {
      logger,
      onError: onRecoverableError,
      tracker,
      videoElement
    };

    if (skipControl) {
      options.hooks = {
        createSkipControl: typeof skipControl === 'function' ? skipControl : () => skipControl
      };
    }

    try {
      const adTag = await Promise.resolve(getTag());
      const adUnit = await runWaterfall(adTag, this.videoAdPlaceholder.current, options);

      adUnit.onError(onNonRecoverableError);
      adUnit.onFinish(onFinish);

      return adUnit;
    } catch (error) {
      onNonRecoverableError(error);

      throw error;
    }
  }

  render () {
    const {
      children,
      height,
      width
    } = this.props;

    const placeHolderStyles = {
      height: height ? `${height}px` : '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: width ? `${width}px` : '100%'
    };

    const adPlaceholderStyles = {
      ...placeHolderStyles,
      display: this.state.ready ? 'block' : 'none'
    };

    return <div style={placeHolderStyles}>
      {!this.state.ready && children}
      <div ref={this.videoAdPlaceholder} style={adPlaceholderStyles} />
    </div>;
  }
}

export default VideoAd;