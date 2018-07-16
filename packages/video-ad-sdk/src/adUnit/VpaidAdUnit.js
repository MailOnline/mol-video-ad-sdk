/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this */
import {linearEvents} from '../tracker';
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
  EVENTS
} from './helpers/vpaid/api';
import waitFor from './helpers/vpaid/waitFor';
import callAndWait from './helpers/vpaid/callAndWait';
import handshake from './helpers/vpaid/handshake';
import initAd from './helpers/vpaid/initAd';
import safeCallback from './helpers/safeCallback';

const {
  complete,
  error: errorEvt,
  skip
} = linearEvents;

const hidden = Symbol('hidden');

class VpaidAdUnit extends Emitter {
  [hidden] = {
    finish: () => {
      this[hidden].onFinishCallbacks.forEach((callback) => callback());
      this[hidden].finished = true;
    },
    finished: false,
    handleVpaidEvt: (event, data) => {
      switch (event) {
      case adVideoComplete: {
        this[hidden].finish();
        this.emit(complete, complete, this);
        break;
      }
      case adError: {
        this.error = data instanceof Error ? data : new Error('VPAID general error');

        this.error.errorCode = 901;
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
      }

      this.emit(event, event, this);
    },
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

  creativeAd = null;

  constructor (vastChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    this.vastChain = vastChain;
    this.videoAdContainer = videoAdContainer;
    this[hidden].loadCreativePromise = loadCreative(vastChain, videoAdContainer);
  }

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

      handshake(this.creativeAd, '2.0');
      initAd(this.creativeAd, this.videoAdContainer, this.vastChain);

      await adLoadedPromise;

      // if the ad timed out while trying to load the videoAdContainer will be destroyed
      if (!this.videoAdContainer.isDestroyed()) {
        try {
          await callAndWait(this.creativeAd, startAd, adStarted);
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

  resume () {
    this[hidden].throwIfNotReady();

    return callAndWait(this.creativeAd, resumeAd, adPlaying);
  }

  pause () {
    this[hidden].throwIfNotReady();

    return callAndWait(this.creativeAd, pauseAd, adPaused);
  }

  setVolume (volume) {
    this[hidden].throwIfNotReady();

    return this.creativeAd[setAdVolume](volume);
  }

  getVolume () {
    this[hidden].throwIfNotReady();

    return this.creativeAd[getAdVolume]();
  }

  cancel () {
    this[hidden].throwIfFinished();

    this.creativeAd[stopAd]();

    this[hidden].finish();
  }

  onFinish (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onFinishCallbacks.push(safeCallback(callback, this.logger));
  }

  onError (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onErrorCallbacks.push(safeCallback(callback, this.logger));
  }

  isFinished () {
    return this[hidden].finished;
  }

  isStarted () {
    return this[hidden].started;
  }

  resize () {
    this[hidden].throwIfNotReady();

    return callAndWait(this.creativeAd, resizeAd, adSizeChange);
  }
}

export default VpaidAdUnit;
