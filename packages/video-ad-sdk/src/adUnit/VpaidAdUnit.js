/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this */
import Emitter from './helpers/Emitter';
import loadCreative from './helpers/vpaid/loadCreative';
import {adLoaded, adStarted} from './helpers/vpaid/vpaidEvents';
import waitFor from './helpers/vpaid/waitFor';
import handshake from './helpers/vpaid/handshake';
import initAd from './helpers/vpaid/initAd';

const hidden = Symbol('hidden');

const callAndWait = (creativeAd, method, event) => {
  const waitPromise = waitFor(creativeAd, event);

  creativeAd[method]();

  return waitPromise;
};

class VpaidAdUnit extends Emitter {
  [hidden] = {
    finished: false,
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

    this.creativeAd = await this[hidden].loadCreativePromise;
    const adLoadedPromise = waitFor(this.creativeAd, adLoaded);

    handshake(this.creativeAd, '2.0');
    initAd(this.creativeAd, this.videoAdContainer, this.vastChain);

    await adLoadedPromise;

    // if the ad timed out while trying to load the videoAdContainer will be destroyed
    if (!this.videoAdContainer.isDestroyed()) {
      await callAndWait(this.creativeAd, 'startAd', adStarted);
      this[hidden].started = true;
    }

    return this;
  }

  resume () {
    this[hidden].throwIfNotReady();
  }

  pause () {
    this[hidden].throwIfNotReady();
  }

  setVolume () {
    this[hidden].throwIfNotReady();
  }

  getVolume () {
    this[hidden].throwIfNotReady();
  }

  cancel () {
    this[hidden].throwIfNotReady();
  }

  onFinish () {
    this[hidden].throwIfFinished();
  }

  onError () {
    this[hidden].throwIfFinished();
  }

  isFinished () {
    return this[hidden].finished;
  }

  isStarted () {
    return this[hidden].started;
  }

  async resize () {
    this[hidden].throwIfNotReady();
  }
}

export default VpaidAdUnit;
