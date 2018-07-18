/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from '../tracker';
import Emitter from './helpers/Emitter';
import findBestMedia from './helpers/media/findBestMedia';
import once from './helpers/dom/once';
import setupMetricHandlers from './helpers/metrics/setupMetricHandlers';
import retrieveIcons from './helpers/icons/retrieveIcons';
import addIcons from './helpers/icons/addIcons';
import safeCallback from './helpers/safeCallback';
import updateMedia from './helpers/media/updateMedia';

const {
  complete,
  iconClick,
  iconView,
  error: errorEvt,
  skip
} = linearEvents;

const hidden = Symbol('hidden');

/**
 * @memberof module:@mol/video-ad-sdk
 * @class
 * @extends Emitter
 * @implements LinearEvents
 * @description This class provides everything necessary to run a Vast ad.
 */
class VastAdUnit extends Emitter {
  [hidden] = {
    finish: () => {
      this[hidden].onFinishCallbacks.forEach((callback) => callback());
      this[hidden].finished = true;
    },
    finished: false,
    handleMetric: (event, data) => {
      switch (event) {
      case complete: {
        this[hidden].finish();
        break;
      }
      case errorEvt: {
        this.error = data;
        this.errorCode = this.error && this.error.errorCode ? this.error.errorCode : 405;
        this[hidden].onErrorCallbacks.forEach((callback) => callback(this.error));
        this[hidden].finish();
        break;
      }
      case skip: {
        this.cancel();
        break;
      }
      }

      this.emit(event, event, this, data);
    },
    onErrorCallbacks: [],
    onFinishCallbacks: [],
    started: false,
    throwIfFinished: () => {
      if (this.isFinished()) {
        throw new Error('VastAdUnit is finished');
      }
    },
    throwIfNotReady: () => {
      this[hidden].throwIfFinished();

      if (!this.isStarted()) {
        throw new Error('VastAdUnit has not started');
      }
    }
  };

  error = null;
  errorCode = null;
  assetUri = null;

  /**
   * Creates a {VastAdUnit}.
   *
   * @param {VastChain} vastChain - The {@see VastChain} with all the {@see VastResponse}
   * @param {VideoAdContainer} videoAdContainer - container instance to place the ad
   * @param {Object} [options] - Options Map. The allowed properties are:
   * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad
   * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
   */
  constructor (vastChain, videoAdContainer, {hooks = {}, logger = console} = {}) {
    super(logger);

    const {
      handleMetric,
      onFinishCallbacks
    } = this[hidden];

    this.hooks = hooks;
    this.vastChain = vastChain;
    this.videoAdContainer = videoAdContainer;

    this.icons = retrieveIcons(vastChain);

    if (this.icons) {
      const {
        drawIcons,
        hasPendingIconRedraws,
        removeIcons
      } = addIcons(this.icons, {
        logger,
        onIconClick: (icon) => this.emit(iconClick, iconClick, this, icon),
        onIconView: (icon) => this.emit(iconView, iconView, this, icon),
        videoAdContainer
      });

      this.drawIcons = drawIcons;
      this.removeIcons = removeIcons;
      this.hasPendingIconRedraws = hasPendingIconRedraws;

      onFinishCallbacks.push(removeIcons);
    }

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
    this[hidden].throwIfFinished();

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

          await this.drawIcons();

          if (this.hasPendingIconRedraws() && !this.isFinished()) {
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

      adUnitError.errorCode = 403;
      this[hidden].handleMetric(errorEvt, adUnitError);
    }

    this[hidden].started = true;
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  resume () {
    this[hidden].throwIfNotReady();
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
    this[hidden].throwIfNotReady();
    const {videoElement} = this.videoAdContainer;

    videoElement.pause();
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
    this[hidden].throwIfNotReady();

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
    this[hidden].throwIfNotReady();

    const {videoElement} = this.videoAdContainer;

    return videoElement.volume;
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  cancel () {
    this[hidden].throwIfNotReady();

    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();

    this[hidden].finish();
  }

  /**
   * Register a callback function that will be called whenever the ad finishes. No matter if it was finished because de ad ended, or cancelled or there was an error playing the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param {Function} callback - will be called once the ad unit finished
   */
  onFinish (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onFinishCallbacks.push(safeCallback(callback, this.logger));
  }

  /**
   * Register a callback function that will be called if there is an error while running the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param {Function} callback - will be called on ad unit error passing the Error instance as the only argument if available.
   */
  onError (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onErrorCallbacks.push(safeCallback(callback, this.logger));
  }

  /**
   * @returns {boolean} - true if the ad unit is finished and false otherwise
   */
  isFinished () {
    return this[hidden].finished;
  }

  /**
   * @returns {boolean} - true if the ad unit has started and false otherwise
   */
  isStarted () {
    return this[hidden].started;
  }

  /**
   * This method resizes the ad unit to fit the available space in the passed {@see VideoAdContainer}
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @returns {Promise} - that resolves once the unit was resized
   */
  async resize () {
    this[hidden].throwIfNotReady();

    if (this.icons) {
      await this.removeIcons();
      await this.drawIcons();
    }

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
