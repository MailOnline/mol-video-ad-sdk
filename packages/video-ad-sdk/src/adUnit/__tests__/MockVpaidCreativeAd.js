import Emitter from '../helpers/Emitter';

class MockVpaidCreativeAd extends Emitter {
  constructor (version = '2.0') {
    super();
    this.version = version;

    this.handshakeVersion = jest.fn(() => version);
    this.initAd = jest.fn();
  }

  subscribe (callback, event) {
    this.on(event, callback);
  }

  unsubscribe (callback, event) {
    this.removeListener(event, callback);
  }
}

export default MockVpaidCreativeAd;
