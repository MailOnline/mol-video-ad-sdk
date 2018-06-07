/* eslint-disable filenames/match-exported */
import React from 'react';
import loadVastChain from '../helpers/loadVastChain';
import tryToStartAd from '../helpers/tryToStartAd';
import makeCancelable from '../helpers/makeCancelable';
import defaultProps from './defaultProps';
import propTypes from './propTypes';

class VideoAd extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  ref = (element) => {
    this.element = element;
  };

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
        changeVolume: (newVolume) => adUnit.changeVolume(newVolume),
        pause: () => adUnit.pause(),
        resume: () => adUnit.resume()
      });
    }
  }

  onAdUnitError = (error) => {
    error.recoverable = true;
    this.props.onError(error);
  };

  async startAd () {
    const {
      getTag,
      logger,
      onComplete,
      onError,
      onLinearEvent,
      tracker,
      videoElement
    } = this.props;

    const options = {
      logger,
      onError: (error) => {
        error.recoverable = true;

        onError(error);
      },
      onLinearEvent,
      tracker,
      videoElement
    };

    try {
      const fetchVastChain = async () => loadVastChain(await Promise.resolve(getTag()));
      const adUnit = await tryToStartAd(fetchVastChain, this.element, options);

      adUnit.onError(this.props.onError);
      adUnit.onComplete(onComplete);

      return adUnit;
    } catch (error) {
      this.props.onError(error);

      throw error;
    }
  }

  render () {
    const {
      children,
      height,
      width
    } = this.props;

    const containerStyles = {
      height: height ? `${height}px` : '100%',
      width: width ? `${width}px` : '100%'
    };

    const adPlaceholderStyles = {
      display: this.state.ready ? 'block' : 'none'
    };

    return <div style={containerStyles}>
      {!this.state.ready && children}
      <div ref={this.ref} style={adPlaceholderStyles} />
    </div>;
  }
}

export default VideoAd;
