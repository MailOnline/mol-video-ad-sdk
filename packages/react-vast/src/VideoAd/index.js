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
    complete: false,
    error: null,
    loading: true
  };

  componentDidMount () {
    this.adUnitPromise = this.startAd();
    this.stateUpdate = makeCancelable(this.adUnitPromise);
    // eslint-disable-next-line promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    this.stateUpdate.promise.then(this.onAdUnit);
  }

  onAdUnit = (adUnit) => {
    this.adUnit = adUnit;

    // eslint-disable-next-line react/no-set-state
    this.setState({
      loading: false
    });
  };

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

    if (!this.state.loading) {
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

  async startAd () {
    const {
      getTag,
      logger,
      onLinearEvent,
      tracker,
      videoElement
    } = this.props;

    const options = {
      logger,
      onError: (error) => {
        error.recoverable = true;
        this.handleError(error);
      },
      onLinearEvent,
      tracker,
      videoElement
    };

    try {
      const fetchVastChain = async () => loadVastChain(await Promise.resolve(getTag()));
      const adUnit = await tryToStartAd(fetchVastChain, this.element, options);

      adUnit.onError(this.handleError);
      adUnit.onComplete(this.handleComplete);

      return adUnit;
    } catch (error) {
      this.handleError(error);

      throw error;
    }
  }

  handleError = (error) => {
    this.setState({error});
    this.props.onError(error);
  };

  handleComplete = () => {
    this.setState({
      complete: true
    });
    this.props.onComplete();
  };

  render () {
    const {
      children,
      height,
      width
    } = this.props;
    const {
      complete,
      error,
      loading
    } = this.state;

    if (complete) {
      return null;
    } else if (error) {
      return this.renderError(error) || null;
    } else if (loading) {

    }

    const containerStyles = {
      height: height ? `${height}px` : '100%',
      width: width ? `${width}px` : '100%'
    };

    const adPlaceholderStyles = {
      display: this.state.loading ? 'none' : 'block'
    };

    return <div style={containerStyles}>
      {this.state.loading && children}
      <div ref={this.ref} style={adPlaceholderStyles} />
    </div>;
  }
}

export default VideoAd;
