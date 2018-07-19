/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this, import/no-named-as-default-member */
import linearEvents from '../tracker/linearEvents';
import {
  acceptInvitation,
  creativeView,
  adCollapse,
  close
} from '../tracker/nonLinearEvents';
import {getClickThrough} from '../vastSelectors';
import Emitter from './helpers/Emitter';
import loadCreative from './helpers/vpaid/loadCreative';
import {
  adLoaded,
  adStarted,
  adPlaying,
  adPaused,
  startAd,
  stopAd,
  resumeAd,
  pauseAd,
  setAdVolume,
  getAdVolume,
  resizeAd,
  adSizeChange,
  adError,
  adVideoComplete,
  adSkipped,
  EVENTS,
  adVolumeChange,
  adImpression,
  adVideoStart,
  adVideoFirstQuartile,
  adVideoMidpoint,
  adVideoThirdQuartile,
  adUserAcceptInvitation,
  adUserMinimize,
  adUserClose,
  adClickThru,
  getAdIcons
} from './helpers/vpaid/api';
import retrieveIcons from './helpers/icons/retrieveIcons';
import addIcons from './helpers/icons/addIcons';
import waitFor from './helpers/vpaid/waitFor';
import callAndWait from './helpers/vpaid/callAndWait';
import handshake from './helpers/vpaid/handshake';
import initAd from './helpers/vpaid/initAd';
import safeCallback from './helpers/safeCallback';

const {
  complete,
  mute,
  unmute,
  skip,
  start,
  firstQuartile,
  pause,
  resume,
  impression,
  midpoint,
  thirdQuartile,
  clickThrough,
  iconClick,
  iconView,
  error: errorEvt
} = linearEvents;

const hidden = Symbol('hidden');

/**
 * @memberof module:@mol/video-ad-sdk
 * @class
 * @alias VpaidAdUnit
 * @extends Emitter
 * @implements NonLinearEvents
 * @implements LinearEvents
 * @description This class provides everything necessary to run a Vpaid ad.
 */
class VpaidAdUnit extends Emitter {
  [hidden] = {
    finish: () => {
      this[hidden].onFinishCallbacks.forEach((callback) => callback());
      this[hidden].finished = true;
    },
    finished: false,
    // eslint-disable-next-line complexity
    handleVpaidEvt: (event, payload) => {
      switch (event) {
      case adVideoComplete: {
        this[hidden].finish();
        this.emit(complete, complete, this);
        break;
      }
      case adError: {
        this.error = payload instanceof Error ? payload : new Error('VPAID general error');

        this.error.errorCode = 901;
        this.errorCode = 901;
        this[hidden].onErrorCallbacks.forEach((callback) => callback(this.error));
        this[hidden].finish();
        this.emit(errorEvt, errorEvt, this, this.error);
        break;
      }
      case adSkipped: {
        this.cancel();
        this.emit(skip, skip, this);
        break;
      }
      case adStarted: {
        this.emit(creativeView, creativeView, this);
        break;
      }
      case adImpression: {
        this.emit(impression, impression, this);
        break;
      }
      case adVideoStart: {
        this.emit(start, start, this);
        break;
      }
      case adVideoFirstQuartile: {
        this.emit(firstQuartile, firstQuartile, this);
        break;
      }
      case adVideoMidpoint: {
        this.emit(midpoint, midpoint, this);
        break;
      }
      case adVideoThirdQuartile: {
        this.emit(thirdQuartile, thirdQuartile, this);
        break;
      }
      case adUserAcceptInvitation: {
        this.emit(acceptInvitation, acceptInvitation, this);
        break;
      }
      case adUserMinimize: {
        this.emit(adCollapse, adCollapse, this);
        break;
      }
      case adUserClose: {
        this.emit(close, close, this);
        break;
      }
      case adPaused: {
        this.emit(pause, pause, this);
        break;
      }
      case adPlaying: {
        this.emit(resume, resume, this);
        break;
      }
      case adClickThru: {
        if (payload && payload.data) {
          const {
            url,
            playerHandles
          } = payload.data;

          if (playerHandles) {
            const clickThroughUrl = url ? url : getClickThrough(this.vastChain[0].ad);

            window.open(clickThroughUrl, '_blank');
          }
        }

        this.emit(clickThrough, clickThrough, this);
        break;
      }
      case adVolumeChange: {
        const volume = this.getVolume();

        if (volume === 0 && !this[hidden].muted) {
          this[hidden].muted = true;
          this.emit(mute, mute, this);
        }

        if (volume > 0 && this[hidden].muted) {
          this[hidden].muted = false;

          this.emit(unmute, unmute, this);
        }

        break;
      }
      }

      this.emit(event, event, this);
    },
    muted: false,
    onErrorCallbacks: [],
    onFinishCallbacks: [],
    started: false,
    throwIfFinished: () => {
      if (this.isFinished()) {
        throw new Error('VpaidAdUnit is finished');
      }
    },
    throwIfNotReady: () => {
      this[hidden].throwIfFinished();

      if (!this.isStarted()) {
        throw new Error('VpaidAdUnit has not started');
      }
    }
  };

  /** Reference to the Vpaid Creative ad unit. Will be null before the ad unit starts. */
  creativeAd = null;

  /**
   * Creates a {VpaidAdUnit}.
   *
   * @param {VastChain} vastChain - The {@see VastChain} with all the {@see VastResponse}
   * @param {VideoAdContainer} videoAdContainer - container instance to place the ad
   * @param {Object} [options] - Options Map. The allowed properties are:
   * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
   * Defaults to `window.console`
   */
  constructor (vastChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    /** Reference to the {@see VastChain} used to load the ad. */
    this.vastChain = vastChain;

    /** Reference to the {@see VideoAdContainer} that contains the ad. */
    this.videoAdContainer = videoAdContainer;
    this[hidden].loadCreativePromise = loadCreative(vastChain, videoAdContainer);
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
      throw new Error('VpaidAdUnit already started');
    }

    try {
      this.creativeAd = await this[hidden].loadCreativePromise;
      const adLoadedPromise = waitFor(this.creativeAd, adLoaded);

      for (const creativeEvt of EVENTS) {
        this.creativeAd.subscribe(this[hidden].handleVpaidEvt.bind(this, creativeEvt), creativeEvt);
      }

      const icons = this.creativeAd[getAdIcons] && this.creativeAd[getAdIcons]() && retrieveIcons(this.vastChain);

      if (icons) {
        this.icons = icons;

        const {
          drawIcons,
          hasPendingIconRedraws,
          removeIcons
        } = addIcons(this.icons, {
          logger: this.logger,
          onIconClick: (icon) => this.emit(iconClick, iconClick, this, icon),
          onIconView: (icon) => this.emit(iconView, iconView, this, icon),
          videoAdContainer: this.videoAdContainer
        });

        this.drawIcons = drawIcons;
        this.removeIcons = removeIcons;
        this.hasPendingIconRedraws = hasPendingIconRedraws;

        this[hidden].onFinishCallbacks.push(removeIcons);
      }

      handshake(this.creativeAd, '2.0');
      initAd(this.creativeAd, this.videoAdContainer, this.vastChain);

      await adLoadedPromise;

      // if the ad timed out while trying to load the videoAdContainer will be destroyed
      if (!this.videoAdContainer.isDestroyed()) {
        try {
          await callAndWait(this.creativeAd, startAd, adStarted);

          if (this.icons) {
            const drawIcons = async () => {
              if (this.isFinished()) {
                return;
              }

              await this.drawIcons();

              if (this.hasPendingIconRedraws() && !this.isFinished()) {
                setTimeout(drawIcons, 500);
              }
            };

            await drawIcons();
          }

          this[hidden].started = true;
        } catch (error) {
          this.cancel();
        }
      }

      return this;
    } catch (error) {
      this[hidden].handleVpaidEvt(adError, error);
      throw error;
    }
  }

  /**
   * Resumes a previously paused ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  resume () {
    this[hidden].throwIfNotReady();
    this.creativeAd[resumeAd]();
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  pause () {
    this[hidden].throwIfNotReady();
    this.creativeAd[pauseAd]();
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

    this.creativeAd[setAdVolume](volume);
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

    return this.creativeAd[getAdVolume]();
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  cancel () {
    this[hidden].throwIfFinished();

    this.creativeAd[stopAd]();

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

    return callAndWait(this.creativeAd, resizeAd, adSizeChange);
  }
}

export default VpaidAdUnit;
