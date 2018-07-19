/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from '../tracker';
import Emitter from './helpers/Emitter';
import retrieveIcons from './helpers/icons/retrieveIcons';
import addIcons from './helpers/icons/addIcons';
import safeCallback from './helpers/safeCallback';

const {
  iconClick,
  iconView
} = linearEvents;

// eslint-disable-next-line id-match
export const _protected = Symbol('_protected');

/**
 * @class
 * @extends Emitter
 * @implements LinearEvents
 * @description This class provides shared logic among all the ad units.
 */
class VideoAdUnit extends Emitter {
 [_protected] = {
   finish: () => {
     this[_protected].onFinishCallbacks.forEach((callback) => callback());
     this[_protected].finished = true;
   },
   finished: false,
   onErrorCallbacks: [],
   onFinishCallbacks: [],
   started: false,
   throwIfCalled: () => {
     throw new Error('VideoAdUnit method must be implemented on child class');
   },
   throwIfFinished: () => {
     if (this.isFinished()) {
       throw new Error('VideoAdUnit is finished');
     }
   },
   throwIfNotReady: () => {
     this[_protected].throwIfFinished();

     if (!this.isStarted()) {
       throw new Error('VideoAdUnit has not started');
     }
   }
 };

  /** If an error occurs it will contain the reference to the error otherwise it will be bull */
  error = null;

  /** If an error occurs it will contain the Vast Error code of the error */
  errorCode = null;

  /**
   * Creates a {@see VideoAdUnit}.
   *
   * @param {VastChain} vastChain - The {@see VastChain} with all the {@see VastResponse}
   * @param {VideoAdContainer} videoAdContainer - container instance to place the ad
   * @param {Object} [options] - Options Map. The allowed properties are:
   * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   * @param {true} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
   * Defaults to `false`
   * @param {true} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes
   * Defaults to `false`
   */
  constructor (vastChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    const {
      onFinishCallbacks
    } = this[_protected];

    /** Reference to the {@see VastChain} used to load the ad. */
    this.vastChain = vastChain;

    /** Reference to the {@see VideoAdContainer} that contains the ad. */
    this.videoAdContainer = videoAdContainer;

    /** Array of {@see VastIcon} definitions to display from the passed {@see VastChain} or null if there are no icons.*/
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

      this[_protected].drawIcons = drawIcons;
      this[_protected].removeIcons = removeIcons;
      this[_protected].hasPendingIconRedraws = hasPendingIconRedraws;

      onFinishCallbacks.push(removeIcons);
    }

    // TODO: implement viewability and responsive logic
  }

  /*
   * Starts the ad unit.
   *
   * @throws if called twice.
   * @throws if ad unit is finished.
   */
  start () {
    this[_protected].throwIfCalled();
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  resume () {
    this[_protected].throwIfCalled();
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  pause () {
    this[_protected].throwIfCalled();
  }

  /**
   * Sets the volume of the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   *
   * @param {number} volume - must be a value between 0 and 1;
   */
  // eslint-disable-next-line no-unused-vars
  setVolume (volume) {
    this[_protected].throwIfCalled();
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
    this[_protected].throwIfCalled();
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  cancel () {
    this[_protected].throwIfCalled();
  }

  /**
   * Register a callback function that will be called whenever the ad finishes. No matter if it was finished because de ad ended, or cancelled or there was an error playing the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param {Function} callback - will be called once the ad unit finished
   */
  onFinish (callback) {
    this[_protected].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[_protected].onFinishCallbacks.push(safeCallback(callback, this.logger));
  }

  /**
   * Register a callback function that will be called if there is an error while running the ad.
   *
   * @throws if ad unit is finished.
   *
   * @param {Function} callback - will be called on ad unit error passing the Error instance as the only argument if available.
   */
  onError (callback) {
    this[_protected].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[_protected].onErrorCallbacks.push(safeCallback(callback, this.logger));
  }

  /**
   * @returns {boolean} - true if the ad unit is finished and false otherwise
   */
  isFinished () {
    return this[_protected].finished;
  }

  /**
   * @returns {boolean} - true if the ad unit has started and false otherwise
   */
  isStarted () {
    return this[_protected].started;
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
    this[_protected].throwIfNotReady();

    if (this.icons) {
      await this[_protected].removeIcons();
      await this[_protected].drawIcons();
    }
  }
}

export default VideoAdUnit;
