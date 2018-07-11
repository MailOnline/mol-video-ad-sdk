/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this */
import Emitter from './helpers/Emitter';
import loadCreative from './helpers/vpaid/loadCreative';
import {adLoaded} from './helpers/vpaid/vpaidEvents';
import waitFor from './helpers/vpaid/waitFor';
import handshake from './helpers/vpaid/handshake';
import initAd from './helpers/vpaid/initAd';

const hidden = Symbol('hidden');

class VpaidAdUnit extends Emitter {
  [hidden] = {
    finished: false,
    started: false,
    throwIfFinished: () => {
      if (this.isFinished()) {
        throw new Error('VpaidAdUnit is finished');
      }
    },
    throwIfNotStarted: () => {
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

    this.creativeAd = await this[hidden].loadCreativePromise;
    const adLoadedPromise = waitFor(this.creativeAd, adLoaded);

    handshake(this.creativeAd, '2.0');
    initAd(this.creativeAd, this.videoAdContainer, this.vastChain);

    await adLoadedPromise;

    this[hidden].started = true;

    return this;
  }

  resume () {

  }

  pause () {

  }

  setVolume () {

  }

  getVolume () {

  }

  cancel () {

  }

  onFinish () {

  }

  onError () {

  }

  isFinished () {
    return this[hidden].finished;
  }

  isStarted () {
    return this[hidden].started;
  }

  async resize () {

  }
}

export default VpaidAdUnit;
