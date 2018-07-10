/* eslint-disable promise/prefer-await-to-callbacks, class-methods-use-this */
import {getInteractiveFiles} from '../vastSelectors';
import Emitter from './helpers/Emitter';
import isSupported from './helpers/vpaid/isSupported';
import loadCreative from './helpers/vpaid/loadCreative';

const hidden = Symbol('hidden');

class VpaidAdUnit extends Emitter {
  [hidden] = {
    destroyed: false,
    started: false
  };

  constructor (vastChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    const creative = (getInteractiveFiles(vastChain[0].ad) || []).filter(isSupported)[0];

    if (!creative) {
      throw new TypeError('VastChain does not contain a supported vpaid creative');
    }

    this[hidden].readyPromise = loadCreative(creative, videoAdContainer);
  }

  async start () {

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
