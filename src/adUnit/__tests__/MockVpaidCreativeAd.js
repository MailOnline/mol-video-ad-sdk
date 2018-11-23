import Emitter from '../helpers/Emitter';
import {
  initAd,
  startAd,
  stopAd,
  resumeAd,
  pauseAd,
  setAdVolume,
  getAdVolume,
  resizeAd,
  adVolumeChange,
  getAdIcons,
  getAdDuration,
  getAdRemainingTime
} from '../helpers/vpaid/api';

class MockVpaidCreativeAd extends Emitter {
  constructor (version = '2.0') {
    super();
    this.version = version;
    this.volume = 0.8;

    this.handshakeVersion = jest.fn(() => version);
    this[initAd] = jest.fn();
    this[startAd] = jest.fn();
    this[stopAd] = jest.fn();
    this[resumeAd] = jest.fn();
    this[pauseAd] = jest.fn();
    this[getAdIcons] = jest.fn();
    this[getAdDuration] = jest.fn();
    this[getAdRemainingTime] = jest.fn();
    this[setAdVolume] = jest.fn((volume) => {
      this.volume = volume;
      this.emit(adVolumeChange);
    });
    this[getAdVolume] = jest.fn(() => this.volume);
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
