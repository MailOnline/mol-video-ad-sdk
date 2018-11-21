/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from '../tracker';
import findBestMedia from './helpers/media/findBestMedia';
import once from './helpers/dom/once';
import setupMetricHandlers from './helpers/metrics/setupMetricHandlers';
import updateMedia from './helpers/media/updateMedia';
import VideoAdUnit, {_protected} from './VideoAdUnit';

const {
  complete,
  error: errorEvt,
  skip
} = linearEvents;

// eslint-disable-next-line id-match
const _private = Symbol('_private');

/**
 * @class
 * @extends VideoAdUnit
 * @alias VastAdUnit
 * @implements LinearEvents
 * @description This class provides everything necessary to run a Vast ad.
 */
class VastAdUnit extends VideoAdUnit {
  [_private] = {
    handleMetric: (event, data) => {
      switch (event) {
      case complete: {
        this[_protected].finish();
        break;
      }
      case errorEvt: {
        this.error = data;
        this.errorCode = this.error && this.error.code ? this.error.code : 405;
        this[_protected].onErrorCallbacks.forEach((callback) => callback(this.error));
        this[_protected].finish();
        break;
      }
      case skip: {
        this.cancel();
        break;
      }
      }

      this.emit(event, {
        adUnit: this,
        type: event
      });
    }
  };

  assetUri = null;

  /** Ad unit type. Will be `VAST` for VastAdUnit */
  type='VAST';

  /**
   * Creates a {VastAdUnit}.
   *
   * @param {VastChain} vastChain - The {@link VastChain} with all the {@link VastResponse}
   * @param {VideoAdContainer} videoAdContainer - container instance to place the ad
   * @param {Object} [options] - Options Map. The allowed properties are:
   * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad.
   * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
   * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
   * Defaults to `false`
   * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
   * Defaults to `false`
   */
  constructor (vastChain, videoAdContainer, options = {}) {
    super(vastChain, videoAdContainer, options);

    const {onFinishCallbacks} = this[_protected];
    const {handleMetric} = this[_private];

    this.hooks = options.hooks || {};

    const removeMetricHandlers = setupMetricHandlers({
      hooks: this.hooks,
      vastChain: this.vastChain,
      videoAdContainer: this.videoAdContainer
    }, handleMetric);

    onFinishCallbacks.push(removeMetricHandlers);
  }

  /**
   * Starts the ad unit.
   *
   * @throws if called twice.
   * @throws if ad unit is finished.
   */
  async start () {
    this[_protected].throwIfFinished();

    if (this.isStarted()) {
      throw new Error('VastAdUnit already started');
    }

    const inlineAd = this.vastChain[0].ad;
    const {videoElement, element} = this.videoAdContainer;
    const media = findBestMedia(inlineAd, videoElement, element);

    if (Boolean(media)) {
      if (this.icons) {
        const drawIcons = async () => {
          if (this.isFinished()) {
            return;
          }

          await this[_protected].drawIcons();

          if (this[_protected].hasPendingIconRedraws() && !this.isFinished()) {
            once(videoElement, 'timeupdate', drawIcons);
          }
        };

        await drawIcons();
      }

      videoElement.src = media.src;
      this.assetUri = media.src;
      videoElement.play();
    } else {
      const adUnitError = new Error('Can\'t find a suitable media to play');

      adUnitError.code = 403;
      this[_private].handleMetric(errorEvt, adUnitError);
    }

    this[_protected].started = true;
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  resume () {
    this[_protected].throwIfNotReady();
    const {videoElement} = this.videoAdContainer;

    videoElement.play();
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  pause () {
    this[_protected].throwIfNotReady();
    const {videoElement} = this.videoAdContainer;

    videoElement.pause();
  }

  /**
   * Returns true if the add is paused and false otherwise
   */
  paused () {
    const {videoElement} = this.videoAdContainer;

    return videoElement.paused;
  }

  /**
   * Sets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @param {number} volume - must be a value between 0 and 1;
   */
  setVolume (volume) {
    this[_protected].throwIfNotReady();

    const {videoElement} = this.videoAdContainer;

    videoElement.volume = volume;
  }

  /**
   * Gets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns {number} - the volume of the ad unit.
   */
  getVolume () {
    this[_protected].throwIfNotReady();

    const {videoElement} = this.videoAdContainer;

    return videoElement.volume;
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  cancel () {
    this[_protected].throwIfFinished();

    this.videoAdContainer.videoElement.pause();

    this[_protected].finish();
  }

  /**
   * Returns the duration of the ad Creative or 0 if there is no creative.
   *
   *
   * @returns {number} - the duration of the ad unit.
   */
  duration () {
    if (!this.isStarted()) {
      return 0;
    }
    const {videoElement} = this.videoAdContainer;

    return videoElement.duration;
  }

  /**
   * Returns the current time of the ad Creative or 0 if there is no creative.
   *
   *
   * @returns {number} - the volume of the ad unit.
   */
  currentTime () {
    if (!this.isStarted()) {
      return 0;
    }
    const {videoElement} = this.videoAdContainer;

    return videoElement.currentTime;
  }

  /**
   * This method resizes the ad unit to fit the available space in the passed {@link VideoAdContainer}
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns {Promise} - that resolves once the unit was resized
   */
  async resize () {
    await super.resize();

    if (this.isStarted()) {
      const inlineAd = this.vastChain[0].ad;
      const {videoElement, element} = this.videoAdContainer;
      const media = findBestMedia(inlineAd, videoElement, element);

      if (Boolean(media) && videoElement.src !== media.src) {
        updateMedia(videoElement, media);
      }
    }
  }
}

export default VastAdUnit;
