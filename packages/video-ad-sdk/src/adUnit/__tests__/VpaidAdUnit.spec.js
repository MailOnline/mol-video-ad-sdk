/* eslint-disable no-loop-func, max-nested-callbacks,  */
import {
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../fixtures';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import loadCreative from '../helpers/vpaid/loadCreative';
import handshake from '../helpers/vpaid/handshake';
import initAd from '../helpers/vpaid/initAd';
import callAndWait from '../helpers/vpaid/callAndWait';
import VpaidAdUnit from '../VpaidAdUnit';
import {
  adLoaded,
  adStarted,
  adStopped,
  adPlaying,
  resumeAd,
  adPaused,
  pauseAd,
  resizeAd,
  adSizeChange,
  adVideoComplete,
  adError,
  EVENTS,
  adSkipped,
  adVolumeChange,
  adImpression,
  adVideoStart,
  adVideoFirstQuartile,
  adVideoMidpoint,
  adVideoThirdQuartile,
  adUserAcceptInvitation,
  adUserMinimize,
  adUserClose,
  adClickThru
} from '../helpers/vpaid/api';
import linearEvents, {
  skip,
  start,
  creativeView,
  mute,
  unmute,
  impression,
  midpoint,
  complete,
  firstQuartile,
  thirdQuartile,
  acceptInvitationLinear,
  adCollapse,
  pause,
  resume,
  close,
  clickThrough
} from '../../tracker/linearEvents';
import MockVpaidCreativeAd from './MockVpaidCreativeAd';

jest.mock('../helpers/vpaid/loadCreative');
jest.mock('../helpers/vpaid/handshake');
jest.mock('../helpers/vpaid/initAd');
jest.mock('../helpers/vpaid/callAndWait');

describe('VpaidAdUnit', () => {
  let vpaidChain;
  let videoAdContainer;

  beforeEach(() => {
    callAndWait.mockImplementation(require.requireActual('../helpers/vpaid/callAndWait').default);
    vpaidChain = [
      {
        ad: vpaidInlineAd,
        errorCode: null,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastVpaidInlineXML
      }
    ];
    videoAdContainer = new VideoAdContainer(document.createElement('DIV'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('must load the creative and publish the passed vastChain and ontainer', () => {
    const adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

    expect(adUnit.vastChain).toBe(vpaidChain);
    expect(adUnit.videoAdContainer).toBe(videoAdContainer);
    expect(loadCreative).toHaveBeenCalledTimes(1);
    expect(loadCreative).toHaveBeenCalledWith(vpaidChain, videoAdContainer);
  });

  describe('start', () => {
    let mockCreativeAd;
    let adUnit;

    beforeEach(() => {
      mockCreativeAd = new MockVpaidCreativeAd();

      initAd.mockImplementation(() => {
        mockCreativeAd.emit(adLoaded);
      });

      mockCreativeAd.startAd.mockImplementation(() => {
        mockCreativeAd.emit(adStarted);
      });

      loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));

      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);
    });

    test('must start the ad', async () => {
      expect(adUnit.isStarted()).toBe(false);

      const res = await adUnit.start();

      expect(res).toBe(adUnit);
      expect(adUnit.isStarted()).toBe(true);
      expect(adUnit.creativeAd).toBe(mockCreativeAd);
      expect(handshake).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledWith(mockCreativeAd, '2.0');
      expect(initAd).toHaveBeenCalledTimes(1);
      expect(initAd).toHaveBeenCalledWith(mockCreativeAd, videoAdContainer, vpaidChain);
      expect(mockCreativeAd.startAd).toHaveBeenCalledTimes(1);
      expect(mockCreativeAd.stopAd).toHaveBeenCalledTimes(0);
    });

    test('must not call startAd if the videoContainer was destroyed while loading the ad', async () => {
      expect(adUnit.isStarted()).toBe(false);
      videoAdContainer.destroy();

      const res = await adUnit.start();

      expect(res).toBe(adUnit);
      expect(adUnit.isStarted()).toBe(false);
      expect(adUnit.creativeAd).toBe(mockCreativeAd);
      expect(handshake).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledWith(mockCreativeAd, '2.0');
      expect(initAd).toHaveBeenCalledTimes(1);
      expect(initAd).toHaveBeenCalledWith(mockCreativeAd, videoAdContainer, vpaidChain);
      expect(mockCreativeAd.startAd).toHaveBeenCalledTimes(0);
      expect(mockCreativeAd.stopAd).toHaveBeenCalledTimes(0);
    });

    test('must call stopAd if adStarted evnt does not get acknowledge', async () => {
      mockCreativeAd.startAd.mockImplementation(() => {
        throw new Error('Error starting ad');
      });

      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      expect(adUnit.isStarted()).toBe(false);

      const res = await adUnit.start();

      expect(res).toBe(adUnit);
      expect(adUnit.isStarted()).toBe(false);
      expect(adUnit.isFinished()).toBe(true);
      expect(adUnit.creativeAd).toBe(mockCreativeAd);
      expect(handshake).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledWith(mockCreativeAd, '2.0');
      expect(initAd).toHaveBeenCalledTimes(1);
      expect(initAd).toHaveBeenCalledWith(mockCreativeAd, videoAdContainer, vpaidChain);
      expect(mockCreativeAd.startAd).toHaveBeenCalledTimes(1);
      expect(mockCreativeAd.stopAd).toHaveBeenCalledTimes(1);
    });

    test('must throw if the adUnit is started', async () => {
      await adUnit.start();

      try {
        await adUnit.start();
      } catch (error) {
        expect(error.message).toBe('VpaidAdUnit already started');
      }
    });
  });

  describe('method', () => {
    let mockCreativeAd;
    let adUnit;

    beforeEach(() => {
      mockCreativeAd = new MockVpaidCreativeAd();

      initAd.mockImplementation(() => {
        mockCreativeAd.emit(adLoaded);
      });

      mockCreativeAd.startAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adStarted);
      });

      mockCreativeAd.stopAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adStopped);
      });

      mockCreativeAd.resumeAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adPlaying);
      });

      mockCreativeAd.pauseAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adPaused);
      });

      mockCreativeAd.resizeAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adSizeChange);
      });

      loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);
    });

    describe('resume', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.resume()).toThrow('VpaidAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.resume()).toThrow('VpaidAdUnit is finished');
      });

      test('must call resumeAd and wait until it receives adPlaying evt', async () => {
        await adUnit.start();
        await adUnit.resume();

        expect(callAndWait).toHaveBeenCalledWith(mockCreativeAd, resumeAd, adPlaying);
      });
    });

    describe('pause', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.pause()).toThrow('VpaidAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.pause()).toThrow('VpaidAdUnit is finished');
      });

      test('must call pauseAd and wait until it receives adPlaying evt', async () => {
        await adUnit.start();
        await adUnit.pause();

        expect(callAndWait).toHaveBeenCalledWith(mockCreativeAd, pauseAd, adPaused);
      });
    });

    describe('getVolume', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.getVolume()).toThrow('VpaidAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.getVolume()).toThrow('VpaidAdUnit is finished');
      });

      test('must call getAdVolume', async () => {
        await adUnit.start();
        await adUnit.getVolume();

        expect(mockCreativeAd.getAdVolume).toHaveBeenCalledTimes(1);
      });
    });

    describe('setVolume', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.setVolume()).toThrow('VpaidAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.setVolume()).toThrow('VpaidAdUnit is finished');
      });

      test('must call getAdVolume', async () => {
        await adUnit.start();
        await adUnit.setVolume();

        expect(mockCreativeAd.setAdVolume).toHaveBeenCalledTimes(1);
      });
    });

    describe('resize', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.resize()).toThrow('VpaidAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.resize()).toThrow('VpaidAdUnit is finished');
      });

      test('must call resizeAd', async () => {
        await adUnit.start();
        await adUnit.resize();

        expect(callAndWait).toHaveBeenCalledWith(mockCreativeAd, resizeAd, adSizeChange);
      });
    });

    describe('cancel', () => {
      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.cancel()).toThrow('VpaidAdUnit is finished');
      });

      test('must call stopAd and finish the adUnit', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(mockCreativeAd.stopAd).toHaveBeenCalledTimes(1);
        expect(adUnit.isFinished()).toBe(true);
      });
    });

    describe('onFinish', () => {
      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.onFinish()).toThrow('VpaidAdUnit is finished');
      });

      test('must throw if you don\'t pass a callback function ', async () => {
        await adUnit.start();

        expect(() => adUnit.onFinish()).toThrow('Expected a callback function');
      });

      test('must be called if the ad unit gets canceled', async () => {
        const callback = jest.fn();

        adUnit.onFinish(callback);

        await adUnit.start();

        expect(callback).not.toHaveBeenCalled();

        await adUnit.cancel();

        expect(callback).toHaveBeenCalledTimes(1);
      });

      test('must be called once the ad unit completes', async () => {
        const callback = jest.fn();

        adUnit.onFinish(callback);

        await adUnit.start();

        expect(callback).not.toHaveBeenCalled();

        adUnit.creativeAd.emit(adVideoComplete);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe('onError', () => {
      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.onError()).toThrow('VpaidAdUnit is finished');
      });

      test('must throw if you don\'t pass a callback function ', async () => {
        await adUnit.start();

        expect(() => adUnit.onError()).toThrow('Expected a callback function');
      });

      test('must call the callback if there is a problem starting the ad', async () => {
        const handshakeVersionError = new Error('Handshake version not supported');
        const callback = jest.fn();

        adUnit.onError(callback);

        handshake.mockImplementationOnce(() => {
          throw handshakeVersionError;
        });

        try {
          await adUnit.start();
        } catch (error) {
          expect(error).toBe(handshakeVersionError);
        }

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(handshakeVersionError);
      });

      test('must call the callback if there is an error with the creativeAd', async () => {
        const callback = jest.fn();

        adUnit.onError(callback);

        await adUnit.start();

        expect(callback).not.toHaveBeenCalled();

        adUnit.creativeAd.emit(adError);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(Error));
        expect(callback).toHaveBeenCalledWith(expect.objectContaining({
          message: 'VPAID general error'
        }));
      });
    });
  });

  describe('creative vpaid event', () => {
    let mockCreativeAd;
    let adUnit;

    beforeEach(() => {
      mockCreativeAd = new MockVpaidCreativeAd();

      initAd.mockImplementation(() => {
        mockCreativeAd.emit(adLoaded);
      });

      mockCreativeAd.startAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adStarted);
      });

      loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);
    });

    for (const vpaidEvt of EVENTS) {
      test(`${vpaidEvt} must be emitted by the ad unit`, async () => {
        const callback = jest.fn();

        adUnit.on(vpaidEvt, callback);
        await adUnit.start();

        adUnit.creativeAd.emit(vpaidEvt);

        expect(callback).toHaveBeenCalledWith(vpaidEvt, adUnit);
      });
    }

    [
      {
        vastEvt: skip,
        vpaidEvt: adSkipped
      },
      {
        vastEvt: creativeView,
        vpaidEvt: adStarted
      },
      {
        vastEvt: impression,
        vpaidEvt: adImpression
      },
      {
        vastEvt: skip,
        vpaidEvt: adSkipped
      },
      {
        vastEvt: start,
        vpaidEvt: adVideoStart
      },
      {
        vastEvt: firstQuartile,
        vpaidEvt: adVideoFirstQuartile
      },
      {
        vastEvt: midpoint,
        vpaidEvt: adVideoMidpoint
      },
      {
        vastEvt: thirdQuartile,
        vpaidEvt: adVideoThirdQuartile
      },
      {
        vastEvt: complete,
        vpaidEvt: adVideoComplete
      },
      {
        vastEvt: acceptInvitationLinear,
        vpaidEvt: adUserAcceptInvitation
      },
      {
        vastEvt: adCollapse,
        vpaidEvt: adUserMinimize
      },
      {
        vastEvt: close,
        vpaidEvt: adUserClose
      },
      {
        vastEvt: pause,
        vpaidEvt: adPaused
      },
      {
        vastEvt: resume,
        vpaidEvt: adPlaying
      },
      {
        vastEvt: clickThrough,
        vpaidEvt: adClickThru
      }
    ].forEach(({vpaidEvt, vastEvt}) => {
      describe(vpaidEvt, () => {
        test(`must emit ${vastEvt} event`, async () => {
          const callback = jest.fn();

          adUnit.on(vastEvt, callback);
          await adUnit.start();

          adUnit.creativeAd.emit(vpaidEvt);

          expect(callback).toHaveBeenCalledWith(vastEvt, adUnit);
        });
      });
    });

    describe(adError, () => {
      // eslint-disable-next-line import/no-named-as-default-member
      const vastEvt = linearEvents.error;

      test(`must emit ${vastEvt} event`, async () => {
        const callback = jest.fn();

        adUnit.on(vastEvt, callback);
        await adUnit.start();

        adUnit.creativeAd.emit(adError);

        expect(callback).toHaveBeenCalledWith(vastEvt, adUnit, expect.any(Error));
        const error = callback.mock.calls[0][2];

        expect(error.message).toBe('VPAID general error');
        expect(error.errorCode).toBe(901);
        expect(adUnit.errorCode).toBe(901);
      });
    });
    describe(adVolumeChange, () => {
      test(`must emit ${mute} event if it becomes muted`, async () => {
        const callback = jest.fn();

        adUnit.on(mute, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0);
        expect(callback).toHaveBeenCalled();
      });

      test(`must emit ${unmute} event if it becomes unmuted`, async () => {
        const callback = jest.fn();

        adUnit.on(unmute, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0);
        expect(callback).not.toHaveBeenCalled();
        adUnit.creativeAd.setAdVolume(0.5);
        expect(callback).toHaveBeenCalled();
      });

      test('must not emit any evnt on normal volume change', async () => {
        const callback = jest.fn();

        adUnit.on(unmute, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0.5);
        adUnit.creativeAd.setAdVolume(0.5);
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});
