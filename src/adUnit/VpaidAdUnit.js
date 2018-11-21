/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this, import/no-named-as-default-member */
import linearEvents from '../tracker/linearEvents';
import {
  acceptInvitation,
  creativeView,
  adCollapse,
  close
} from '../tracker/nonLinearEvents';
import {getClickThrough} from '../vastSelectors';
import {volumeChanged} from './adUnitEvents';
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
import waitFor from './helpers/vpaid/waitFor';
import callAndWait from './helpers/vpaid/callAndWait';
import handshake from './helpers/vpaid/handshake';
import initAd from './helpers/vpaid/initAd';
import VideoAdUnit, {_protected} from './VideoAdUnit';

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
  error: errorEvt
} = linearEvents;

// eslint-disable-next-line id-match
const _private = Symbol('_private');

const vpaidGeneralError = (payload) => {
  const error = payload instanceof Error ? payload : new Error('VPAID general error');

  if (!error.code) {
    error.code = 901;
  }

  return error;
};

/**
 * @class
 * @alias VpaidAdUnit
 * @extends VideoAdUnit
 * @implements NonLinearEvents
 * @implements LinearEvents
 * @description This class provides everything necessary to run a Vpaid ad.
 */
class VpaidAdUnit extends VideoAdUnit {
  [_private] = {
    // eslint-disable-next-line complexity
    handleVpaidEvt: (event, payload) => {
      switch (event) {
      case adVideoComplete: {
        this[_protected].finish();
        this.emit(complete, {
          adUnit: this,
          type: complete
        });
        break;
      }
      case adError: {
        this.error = vpaidGeneralError(payload);
        this.errorCode = this.error.code;
        this[_protected].onErrorCallbacks.forEach((callback) => callback(this.error));
        this[_protected].finish();
        this.emit(errorEvt, {
          adUnit: this,
          type: errorEvt
        });
        break;
      }
      case adSkipped: {
        this.cancel();
        this.emit(skip, {
          adUnit: this,
          type: skip
        });
        break;
      }
      case adStarted: {
        this.emit(creativeView, {
          adUnit: this,
          type: creativeView
        });
        break;
      }
      case adImpression: {
        this.emit(impression, {
          adUnit: this,
          type: impression
        });
        break;
      }
      case adVideoStart: {
        this[_private].paused = false;
        this.emit(start, {
          adUnit: this,
          type: start
        });
        break;
      }
      case adVideoFirstQuartile: {
        this.emit(firstQuartile, {
          adUnit: this,
          type: firstQuartile
        });
        break;
      }
      case adVideoMidpoint: {
        this.emit(midpoint, {
          adUnit: this,
          type: midpoint
        });
        break;
      }
      case adVideoThirdQuartile: {
        this.emit(thirdQuartile, {
          adUnit: this,
          type: thirdQuartile
        });
        break;
      }
      case adUserAcceptInvitation: {
        this.emit(acceptInvitation, {
          adUnit: this,
          type: acceptInvitation
        });
        break;
      }
      case adUserMinimize: {
        this.emit(adCollapse, {
          adUnit: this,
          type: adCollapse
        });
        break;
      }
      case adUserClose: {
        this.emit(close, {
          adUnit: this,
          type: close
        });
        break;
      }
      case adPaused: {
        this[_private].paused = true;
        this.emit(pause, {
          adUnit: this,
          type: pause
        });
        break;
      }
      case adPlaying: {
        this[_private].paused = false;
        this.emit(resume, {
          adUnit: this,
          type: resume
        });
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

        this.emit(clickThrough, {
          adUnit: this,
          type: clickThrough
        });
        break;
      }
      case adVolumeChange: {
        const volume = this.getVolume();

        this.emit(
          volumeChanged,
          {
            adUnit: this,
            type: volumeChanged
          });

        if (volume === 0 && !this[_private].muted) {
          this[_private].muted = true;
          this.emit(mute, {
            adUnit: this,
            type: mute
          });
        }

        if (volume > 0 && this[_private].muted) {
          this[_private].muted = false;

          this.emit(unmute, {
            adUnit: this,
            type: unmute
          });
        }

        break;
      }
      }

      this.emit(event, {
        adUnit: this,
        type: event
      });
    },
    muted: false,
    paused: true
  };

  /** Ad unit type. Will be `VPAID` for VpaidAdUnit */
  type='VPAID';

  /** Reference to the Vpaid Creative ad unit. Will be null before the ad unit starts. */
  creativeAd = null;

  /**
   * Creates a {VpaidAdUnit}.
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
   * Defaults to `window.console`
   */
  constructor (vastChain, videoAdContainer, options = {}) {
    super(vastChain, videoAdContainer, options);

    this[_private].loadCreativePromise = loadCreative(vastChain, videoAdContainer);
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
      throw new Error('VpaidAdUnit already started');
    }

    try {
      this.creativeAd = await this[_private].loadCreativePromise;
      const adLoadedPromise = waitFor(this.creativeAd, adLoaded);

      for (const creativeEvt of EVENTS) {
        this.creativeAd.subscribe(this[_private].handleVpaidEvt.bind(this, creativeEvt), creativeEvt);
      }

      if (this.creativeAd[getAdIcons] && !this.creativeAd[getAdIcons]()) {
        this.icons = null;
      }

      handshake(this.creativeAd, '2.0');
      initAd(this.creativeAd, this.videoAdContainer, this.vastChain);

      await adLoadedPromise;

      // if the ad timed out while trying to load the videoAdContainer will be destroyed
      if (!this.videoAdContainer.isDestroyed()) {
        try {
          const {videoElement} = this.videoAdContainer;

          if (videoElement.muted) {
            this[_private].muted = true;
            this.setVolume(0);
          } else {
            this.setVolume(videoElement.volume);
          }

          await callAndWait(this.creativeAd, startAd, adStarted);

          if (this.icons) {
            const drawIcons = async () => {
              if (this.isFinished()) {
                return;
              }

              await this[_protected].drawIcons();

              if (this[_protected].hasPendingIconRedraws() && !this.isFinished()) {
                setTimeout(drawIcons, 500);
              }
            };

            await drawIcons();
          }

          this[_protected].started = true;
        } catch (error) {
          this.cancel();
        }
      }

      return this;
    } catch (error) {
      this[_private].handleVpaidEvt(adError, error);
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
    this[_protected].throwIfNotReady();
    this.creativeAd[resumeAd]();
  }

  /**
   * Pauses the ad unit.
   *
   * @throws if ad unit is not started.
   * @throws if ad unit is finished.
   */
  pause () {
    this[_protected].throwIfNotReady();
    this.creativeAd[pauseAd]();
  }

  /**
   * Returns true if the add is paused and false otherwise
   */
  paused () {
    return this.isFinished() || this[_private].paused;
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
    return this.creativeAd[getAdVolume]();
  }

  /**
   * Cancels the ad unit.
   *
   * @throws if ad unit is finished.
   */
  cancel () {
    this[_protected].throwIfFinished();

    this.creativeAd[stopAd]();

    this[_protected].finish();
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

    return callAndWait(this.creativeAd, resizeAd, adSizeChange);
  }
}

export default VpaidAdUnit;
