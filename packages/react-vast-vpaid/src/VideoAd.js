/* eslint-disable filenames/match-exported */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {runWaterfall} from '@mol/video-ad-sdk';
import makeCancelable from './helpers/makeCancelable';

const noop = () => {};
const defer = () => {
  const deferred = {};
  const promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  deferred.promise = promise;

  return deferred;
};

/**
  * @memberof module:@mol/react-vast-vpaid
  * @class
  * @extends React.Component
  * @alias VideoAd
  * @description React component to lad a vast/vpaid video ad.
  */
class VideoAd extends Component {
  static defaultProps = {
    children: undefined,
    height: undefined,
    logger: console,
    onAdStart: noop,
    onError: noop,
    onRunFinish: noop,
    responsive: false,
    skipControl: undefined,
    tracker: undefined,
    videoElement: undefined,
    viewability: false,
    width: undefined
  };

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.any]),
    getTag: PropTypes.func.isRequired,
    height: PropTypes.number,
    logger: PropTypes.shape({
      error: PropTypes.func,
      log: PropTypes.func
    }),
    onAdStart: PropTypes.func,
    onError: PropTypes.func,
    onRunFinish: PropTypes.func,
    responsive: PropTypes.bool,
    skipControl: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
    tracker: PropTypes.func,
    videoElement: PropTypes.any,
    viewability: PropTypes.bool,
    width: PropTypes.number
  };

  /**
   * Create a {@link VideoAd} component.
   *
   * @param {Object} props - react props.
   * @param {Function} props.getTag - must return an ad tag or a promise that will resolve with an ad tag.
   * @param {React.nodes} [props.children] - whatever you pass as children will be displayed while the ad is loading.
   * @param {Function|HTMLElement} [props.skipControl] - If a function is provided it will be called to generate the skip control. The skip control must be a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
   * @param {number} [props.height] - the component will resize the ad unit if the passed height changes.
   * @param {number} [props.width] - the component will resize the ad unit if the passed width changes.
   * @param {Console} [props.logger] - must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   * @param {runWaterfall~onAdStart} [props.onAdStart] - will be called once the ad starts with the ad unit.
   * @param {runWaterfall~onError} [props.onError] - will be called if there is an error with the video ad with the error instance.
   * @param {runWaterfall~onRunFinish} [props.onRunFinish] - will be called whenever the ad run finishes. Can be used to know when to unmount the component
   * @param {TrackerFn} [props.tracker] - If provided it will be used to track the VAST events instead of the default {@link pixelTracker}.
   * @param {HTMLVideoElement} [props.videoElement] - If provided it will be used to display the video ad. Beware that it will not clean the sources after the ad is finished.
   * @param {boolean} [props.viewability] - if true it will pause the ad whenever is not visible for the viewer.
   * Defaults to `false`
   * @param {boolean} [props.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
   * Defaults to `false`
   */
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

      // eslint-disable-next-line promise/always-return
      if (typeof this.props.onAdStart === 'function') {
        this.props.onAdStart(adUnit);
      }
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
      width
    } = this.props;

    const adUnit = this.adUnit;

    if (this.state.ready && adUnit) {
      if (height !== prevProps.height || width !== prevProps.width && !adUnit.isFinished()) {
        adUnit.resize();
      }
    }
  }

  async startAd () {
    const {
      getTag,
      logger,
      onError,
      onRunFinish,
      responsive,
      skipControl,
      tracker,
      viewability,
      videoElement
    } = this.props;

    const options = {
      logger,
      onError,
      onRunFinish,
      responsive,
      tracker,
      videoElement,
      viewability
    };

    if (skipControl) {
      options.hooks = {
        createSkipControl: typeof skipControl === 'function' ? skipControl : () => skipControl
      };
    }

    try {
      const adTag = await Promise.resolve(getTag());
      const deferred = defer();
      const onAdStart = (adUnit) => {
        deferred.resolve(adUnit);
      };

      runWaterfall(adTag, this.videoAdPlaceholder.current, {
        ...options,
        onAdStart
      });

      return deferred.promise;
    } catch (error) {
      onError(error);
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
