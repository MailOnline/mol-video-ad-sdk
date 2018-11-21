/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from '../tracker';
import {finish} from './adUnitEvents';
import {
  onElementVisibilityChange,
  onElementResize
} from './helpers/dom/elementObservers';
import preventManualProgress from './helpers/dom/preventManualProgress';
import Emitter from './helpers/Emitter';
import retrieveIcons from './helpers/icons/retrieveIcons';
import addIcons from './helpers/icons/addIcons';
import safeCallback from './helpers/safeCallback';

const {
  start,
  iconClick,
  iconView
} = linearEvents;

// eslint-disable-next-line id-match
export const _protected = Symbol('_protected');

/**
 * @class
 * @extends Emitter
 * @alias VideoAdUnit
 * @implements LinearEvents
 * @description This class provides shared logic among all the ad units.
 */
class VideoAdUnit extends Emitter {
 [_protected] = {
   finish: () => {
     this[_protected].finished = true;
     this[_protected].onFinishCallbacks.forEach((callback) => callback());

     this.emit(
       finish,
       {
         adUnit: this,
         type: finish
       });
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

   /** Ad unit type */
   type=null;

  /** If an error occurs it will contain the reference to the error otherwise it will be bull */
  error = null;

  /** If an error occurs it will contain the Vast Error code of the error */
  errorCode = null;

  /**
   * Creates a {@link VideoAdUnit}.
   *
   * @param {VastChain} vastChain - The {@link VastChain} with all the {@link VastResponse}
   * @param {VideoAdContainer} videoAdContainer - container instance to place the ad
   * @param {Object} [options] - Options Map. The allowed properties are:
   * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
   * Defaults to `false`
   * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes
   * Defaults to `false`
   */
  constructor (vastChain, videoAdContainer, {viewability = false, responsive = false, logger = console} = {}) {
    super(logger);

    const {
      onFinishCallbacks
    } = this[_protected];

    /** Reference to the {@link VastChain} used to load the ad. */
    this.vastChain = vastChain;

    /** Reference to the {@link VideoAdContainer} that contains the ad. */
    this.videoAdContainer = videoAdContainer;

    /** Array of {@link VastIcon} definitions to display from the passed {@link VastChain} or null if there are no icons.*/
    this.icons = retrieveIcons(vastChain);

    onFinishCallbacks.push(preventManualProgress(this.videoAdContainer.videoElement));

    if (this.icons) {
      const {
        drawIcons,
        hasPendingIconRedraws,
        removeIcons
      } = addIcons(this.icons, {
        logger,
        onIconClick: (icon) => this.emit(iconClick, {
          adUnit: this,
          icon,
          type: iconClick
        }),
        onIconView: (icon) => this.emit(iconView, {
          adUnit: this,
          icon,
          type: iconView
        }),
        videoAdContainer
      });

      this[_protected].drawIcons = drawIcons;
      this[_protected].removeIcons = removeIcons;
      this[_protected].hasPendingIconRedraws = hasPendingIconRedraws;

      onFinishCallbacks.push(removeIcons);
    }

    if (viewability) {
      this.once(start, () => {
        const unsubscribe = onElementVisibilityChange(this.videoAdContainer.element, (visible) => {
          if (this.isFinished()) {
            return;
          }

          if (visible) {
            this.resume();
          } else {
            this.pause();
          }
        });

        onFinishCallbacks.push(unsubscribe);
      });
    }

    if (responsive) {
      this.once(start, () => {
        const {element} = this.videoAdContainer;

        this[_protected].size = {
          height: element.clientHeight,
          width: element.clientWidth
        };
        const unsubscribe = onElementResize(element, () => {
          if (this.isFinished()) {
            return;
          }

          const prevSize = this[_protected].size;
          const height = element.clientHeight;
          const width = element.clientWidth;

          this[_protected].size = {
            height: element.clientHeight,
            width: element.clientWidth
          };

          if (height !== prevSize.height || width !== prevSize.width) {
            this.resize();
          }
        });

        onFinishCallbacks.push(unsubscribe);
      });
    }
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
   * Returns the duration of the ad Creative or 0 if there is no creative.
   *
   *
   * @returns {number} - the duration of the ad unit.
   */
  duration () {
    this[_protected].throwIfCalled();
  }

  /**
   * Returns true if the add is paused and false otherwise
   */
  paused () {
    this[_protected].throwIfCalled();
  }

  /**
   * Returns the current time of the ad Creative or 0 if there is no creative.
   *
   *
   * @returns {number} - the volume of the ad unit.
   */
  currentTime () {
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
   * This method resizes the ad unit to fit the available space in the passed {@link VideoAdContainer}
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
