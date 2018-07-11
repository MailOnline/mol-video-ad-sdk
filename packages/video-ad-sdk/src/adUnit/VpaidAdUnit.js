/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this */
import {getInteractiveFiles} from '../vastSelectors';
import Emitter from './helpers/Emitter';
import isSupported from './helpers/vpaid/isSupported';
import init from './helpers/vpaid/init';

const hidden = Symbol('hidden');

class VpaidAdUnit extends Emitter {
  [hidden] = {
    finished: false,
    started: false
  };

  constructor (vastChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    const creative = (getInteractiveFiles(vastChain[0].ad) || []).filter(isSupported)[0];

    if (!creative) {
      throw new TypeError('VastChain does not contain a supported vpaid creative');
    }

    this[hidden].initPromise = init(creative, videoAdContainer);
  }

  async start () {
    this.creativeAd = await this[hidden].initPromise;

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

  }

  isStarted () {

  }

  async resize () {

  }
}

export default VpaidAdUnit;
