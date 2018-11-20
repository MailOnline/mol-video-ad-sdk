/* eslint-disable no-loop-func, max-nested-callbacks */
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
  adClickThru,
  getAdIcons
} from '../helpers/vpaid/api';
import linearEvents, {
  skip,
  start,
  mute,
  unmute,
  impression,
  midpoint,
  complete,
  firstQuartile,
  thirdQuartile,
  pause,
  resume,
  clickThrough,
  iconClick,
  iconView
} from '../../tracker/linearEvents';
import {
  acceptInvitation,
  creativeView,
  adCollapse,
  close
} from '../../tracker/nonLinearEvents';
import addIcons from '../helpers/icons/addIcons';
import retrieveIcons from '../helpers/icons/retrieveIcons';
import {volumeChanged} from '../adUnitEvents';
import MockVpaidCreativeAd from './MockVpaidCreativeAd';

jest.mock('../helpers/vpaid/loadCreative');
jest.mock('../helpers/vpaid/handshake');
jest.mock('../helpers/vpaid/initAd');
jest.mock('../helpers/vpaid/callAndWait');

const mockDrawIcons = jest.fn();
const mockRemoveIcons = jest.fn();
const mockHasPendingRedraws = jest.fn(() => false);

jest.mock('../helpers/icons/addIcons.js', () =>
  jest.fn(
    () => ({
      drawIcons: mockDrawIcons,
      hasPendingIconRedraws: mockHasPendingRedraws,
      removeIcons: mockRemoveIcons
    })
  )
);
jest.mock('../helpers/icons/retrieveIcons.js', () => jest.fn());

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

  test('must load the creative and publish the passed vastChain and container', () => {
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
      retrieveIcons.mockReturnValue(null);

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

    test('must call stopAd if adStarted event does not get acknowledged', async () => {
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

    describe('with creativeAd\'s adIcon property', () => {
      test('undefined (VPAID 1) must not render the icons', async () => {
        delete mockCreativeAd[getAdIcons];
        await adUnit.start();

        expect(adUnit.icons).toBe(null);
      });

      test('false, must not render the icons', async () => {
        mockCreativeAd[getAdIcons].mockReturnValue(false);
        await adUnit.start();

        expect(adUnit.icons).toBe(null);
      });

      describe('true,', () => {
        test('without vast icons, must not add the icons', async () => {
          mockCreativeAd[getAdIcons].mockReturnValue(true);
          await adUnit.start();

          expect(retrieveIcons).toHaveBeenCalledTimes(1);
          expect(retrieveIcons).toHaveBeenCalledWith(adUnit.vastChain);
          expect(addIcons).not.toHaveBeenCalled();
        });

        test('with vast icons, must render the icons', async () => {
          addIcons.mockClear();
          retrieveIcons.mockClear();

          const icons = [{
            height: 20,
            width: 20,
            xPosition: 'left',
            yPosition: 'top'
          }];

          retrieveIcons.mockReturnValue(icons);
          mockCreativeAd[getAdIcons].mockReturnValue(true);
          adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

          await adUnit.start();

          expect(retrieveIcons).toHaveBeenCalledTimes(1);
          expect(retrieveIcons).toHaveBeenCalledWith(adUnit.vastChain);
          expect(addIcons).toHaveBeenCalledTimes(1);
          expect(addIcons).toHaveBeenCalledWith(icons, {
            logger: adUnit.logger,
            onIconClick: expect.any(Function),
            onIconView: expect.any(Function),
            videoAdContainer
          });

          expect(mockDrawIcons).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('with icons', () => {
    let mockCreativeAd;
    let adUnit;

    beforeEach(() => {
      jest.useFakeTimers();

      mockCreativeAd = new MockVpaidCreativeAd();

      initAd.mockImplementation(() => {
        mockCreativeAd.emit(adLoaded);
      });

      mockCreativeAd.startAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adStarted);
      });

      mockCreativeAd.resizeAd.mockImplementationOnce(() => {
        mockCreativeAd.emit(adSizeChange);
      });

      loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    test('must remove the icons on ad finish', async () => {
      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      await adUnit.start();

      adUnit.cancel();

      expect(mockRemoveIcons).toHaveBeenCalledTimes(1);
    });

    test('must redraw the icons on adUnit resize', async () => {
      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      await adUnit.start();

      expect(mockDrawIcons).toHaveBeenCalledTimes(1);

      await adUnit.resize();

      expect(mockDrawIcons).toHaveBeenCalledTimes(2);
    });

    test(`must emit '${iconClick}' event on click`, async () => {
      addIcons.mockClear();

      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      await adUnit.start();

      expect(adUnit.icons).toBe(icons);

      const passedConfig = addIcons.mock.calls[0][1];

      const promise = new Promise((resolve) => {
        adUnit.on(iconClick, (...args) => {
          resolve(args);
        });
      });

      passedConfig.onIconClick(icons[0]);

      const passedArgs = await promise;

      expect(passedArgs).toEqual([{
        adUnit,
        icon: icons[0],
        type: iconClick
      }]);
    });

    test(`must emit '${iconView}' event on view`, async () => {
      addIcons.mockClear();
      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);
      await adUnit.start();

      expect(adUnit.icons).toBe(icons);

      const passedConfig = addIcons.mock.calls[0][1];

      const promise = new Promise((resolve) => {
        adUnit.on(iconView, (...args) => {
          resolve(args);
        });
      });

      passedConfig.onIconView(icons[0]);

      const passedArgs = await promise;

      expect(passedArgs).toEqual([{
        adUnit,
        icon: icons[0],
        type: iconView
      }]);
    });

    test('must periodically redraw the icons while it has pendingIconRedraws', async () => {
      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      mockHasPendingRedraws.mockReturnValueOnce(true);
      mockHasPendingRedraws.mockReturnValueOnce(false);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      await adUnit.start();
      expect(mockDrawIcons).toHaveBeenCalledTimes(1);
      jest.runOnlyPendingTimers();
      expect(mockDrawIcons).toHaveBeenCalledTimes(2);
      jest.runOnlyPendingTimers();
      expect(mockDrawIcons).toHaveBeenCalledTimes(2);
    });

    test('must avoid redraw the icons if the adUnit is finished', async () => {
      const icons = [{
        height: 20,
        width: 20,
        xPosition: 'left',
        yPosition: 'top'
      }];

      retrieveIcons.mockReturnValue(icons);
      mockCreativeAd[getAdIcons].mockReturnValue(true);
      mockHasPendingRedraws.mockReturnValueOnce(true);
      mockHasPendingRedraws.mockReturnValueOnce(false);
      adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      await adUnit.start();
      expect(mockDrawIcons).toHaveBeenCalledTimes(1);
      adUnit.cancel();

      expect(mockDrawIcons).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
      expect(mockDrawIcons).toHaveBeenCalledTimes(1);
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
        expect(() => adUnit.resume()).toThrow('VideoAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.resume()).toThrow('VideoAdUnit is finished');
      });

      test('must call resumeAd', async () => {
        await adUnit.start();
        await adUnit.resume();

        expect(adUnit.creativeAd[resumeAd]).toHaveBeenCalledTimes(1);
      });
    });

    describe('pause', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.pause()).toThrow('VideoAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.pause()).toThrow('VideoAdUnit is finished');
      });

      test('must call pauseAd', async () => {
        await adUnit.start();
        await adUnit.pause();

        expect(adUnit.creativeAd[pauseAd]).toHaveBeenCalledTimes(1);
      });
    });

    describe('getVolume', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.getVolume()).toThrow('VideoAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.getVolume()).toThrow('VideoAdUnit is finished');
      });

      test('must call getAdVolume', async () => {
        await adUnit.start();
        await adUnit.getVolume();

        expect(mockCreativeAd.getAdVolume).toHaveBeenCalledTimes(1);
      });
    });

    describe('setVolume', () => {
      test('must throw if the adUnit is not started', () => {
        expect(() => adUnit.setVolume()).toThrow('VideoAdUnit has not started');
      });

      test('must throw if the adUnit is finished', async () => {
        await adUnit.start();
        await adUnit.cancel();

        expect(() => adUnit.setVolume()).toThrow('VideoAdUnit is finished');
      });

      test('must call getAdVolume', async () => {
        await adUnit.start();
        await adUnit.setVolume();

        expect(mockCreativeAd.setAdVolume).toHaveBeenCalledTimes(1);
      });
    });

    describe('resize', () => {
      test('must throw if the adUnit is not started', async () => {
        expect.assertions(1);

        try {
          await adUnit.resize();
        } catch (error) {
          expect(error.message).toBe('VideoAdUnit has not started');
        }
      });

      test('must throw if the adUnit is finished', async () => {
        expect.assertions(1);

        await adUnit.start();
        await adUnit.cancel();

        try {
          await adUnit.resize();
        } catch (error) {
          expect(error.message).toBe('VideoAdUnit is finished');
        }
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

        expect(() => adUnit.cancel()).toThrow('VideoAdUnit is finished');
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

        expect(() => adUnit.onFinish()).toThrow('VideoAdUnit is finished');
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

        expect(() => adUnit.onError()).toThrow('VideoAdUnit is finished');
      });

      test('must throw if you don\'t pass a callback function ', async () => {
        await adUnit.start();

        expect(() => adUnit.onError()).toThrow('Expected a callback function');
      });

      test('must call the callback if there is a problem starting the ad', async () => {
        expect.assertions(3);
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
          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(handshakeVersionError);
        }
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

        expect(callback).toHaveBeenCalledWith({
          adUnit,
          type: vpaidEvt
        });
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
        vastEvt: acceptInvitation,
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
        payload: {
          data: {
            playerHandles: true,
            url: 'https://test.example.com/clickThrough'
          }
        },
        vastEvt: clickThrough,
        vpaidEvt: adClickThru

      }
    ].forEach(({vpaidEvt, vastEvt, payload}) => {
      describe(vpaidEvt, () => {
        test(`must emit ${vastEvt} event`, async () => {
          const callback = jest.fn();

          adUnit.on(vastEvt, callback);
          await adUnit.start();

          adUnit.creativeAd.emit(vpaidEvt, payload);
          expect(callback).toHaveBeenCalledWith({
            adUnit,
            type: vastEvt
          });
        });
      });
    });

    describe(adClickThru, () => {
      let origOpen;

      beforeEach(() => {
        origOpen = window.open;
        window.open = jest.fn();
      });

      afterEach(() => {
        window.open = origOpen;
      });

      test('must not open a new tab if `playerHandles` is false', async () => {
        const payload = {
          data: {
            playerHandles: false,
            url: 'https://test.example.com/clickThrough'
          }
        };

        await adUnit.start();

        adUnit.creativeAd.emit(adClickThru, payload);
        expect(window.open).not.toHaveBeenCalled();
      });

      describe('with `playerHandles` true', () => {
        test('must open the provided url in a new tab', async () => {
          const payload = {
            data: {
              playerHandles: true,
              url: 'https://test.example.com/vpaid/clickUrl'
            }
          };

          await adUnit.start();

          adUnit.creativeAd.emit(adClickThru, payload);
          expect(window.open).toHaveBeenCalledTimes(1);
          expect(window.open).toHaveBeenCalledWith('https://test.example.com/vpaid/clickUrl', '_blank');
        });

        test('must use vast clickthrough url if no url is provided', async () => {
          const payload = {
            data: {
              playerHandles: true
            }
          };

          await adUnit.start();

          adUnit.creativeAd.emit(adClickThru, payload);
          expect(window.open).toHaveBeenCalledTimes(1);
          expect(window.open).toHaveBeenCalledWith('https://test.example.com/clickthrough', '_blank');
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

        expect(callback).toHaveBeenCalledWith({
          adUnit,
          type: vastEvt
        });
        const error = adUnit.error;

        expect(error.message).toBe('VPAID general error');
        expect(error.errorCode).toBe(901);
        expect(adUnit.errorCode).toBe(901);
      });
    });

    describe(adVolumeChange, () => {
      test(`must emit ${volumeChanged} event`, async () => {
        const callback = jest.fn();

        adUnit.on(volumeChanged, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          adUnit,
          type: volumeChanged
        });
      });

      test(`must emit ${mute} event if it becomes muted`, async () => {
        const callback = jest.fn();

        adUnit.on(mute, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          adUnit,
          type: mute
        });
      });

      test(`must emit ${unmute} event if it becomes unmuted`, async () => {
        const callback = jest.fn();

        adUnit.on(unmute, callback);
        await adUnit.start();

        adUnit.creativeAd.setAdVolume(0);
        expect(callback).not.toHaveBeenCalled();
        adUnit.creativeAd.setAdVolume(0.5);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({
          adUnit,
          type: unmute
        });
      });

      test('must not emit any event on normal volume change', async () => {
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
