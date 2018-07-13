import Emitter from '../helpers/Emitter';
import {initAd, startAd, stopAd, resumeAd, pauseAd, setAdVolume, getAdVolume, resizeAd} from '../helpers/vpaid/api';

class MockVpaidCreativeAd extends Emitter {
  constructor (version = '2.0') {
    super();
    this.version = version;

    this.handshakeVersion = jest.fn(() => version);
    this[initAd] = jest.fn();
    this[startAd] = jest.fn();
    this[stopAd] = jest.fn();
    this[resumeAd] = jest.fn();
    this[pauseAd] = jest.fn();
    this[setAdVolume] = jest.fn();
    this[getAdVolume] = jest.fn();
    this[resizeAd] = jest.fn();
  }

  subscribe (callback, event) {
    this.on(event, callback);
  }

  unsubscribe (callback, event) {
    this.removeListener(event, callback);
  }
}

export default MockVpaidCreativeAd;
