/* eslint-disable promise/prefer-await-to-callbacks */
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures';
import createVideoAdContainer from '../../adContainer/createVideoAdContainer';
import {linearEvents} from '../../tracker';
import VastAdUnit from '../VastAdUnit';
import canPlay from '../helpers/media/canPlay';
import updateMedia from '../helpers/media/updateMedia';
import metricHandlers from '../helpers/metrics/handlers';
import addIcons from '../helpers/icons/addIcons';
import retrieveIcons from '../helpers/icons/retrieveIcons';

const {
  iconClick,
  iconView,
  error: errorEvt
} = linearEvents;
const mockStopMetricHandler = jest.fn();

jest.mock('../helpers/media/canPlay');
jest.mock('../helpers/media/updateMedia');
jest.mock('../helpers/metrics/handlers/index', () => [
  jest.fn(({videoElement}, callback) => {
    videoElement.addEventListener('ended', () => callback('complete'));
    videoElement.addEventListener('error', () => callback('error', videoElement.error));
    videoElement.addEventListener('progress', ({detail}) => callback('progress', detail));
    videoElement.addEventListener('custom', (event) => callback('custom', event.data));

    return mockStopMetricHandler;
  }),
  jest.fn(() => mockStopMetricHandler)
]);

const mockDrawIcons = jest.fn();
const mockRemoveIcons = jest.fn();

jest.mock('../helpers/icons/addIcons.js', () =>
  jest.fn(
    () => ({
      drawIcons: mockDrawIcons,
      hasPendingIconRedraws: () => false,
      removeIcons: mockRemoveIcons
    })
  )
);
jest.mock('../helpers/icons/retrieveIcons.js', () => jest.fn());

describe('VastAdUnit', () => {
  let vastChain;
  let videoAdContainer;

  beforeEach(async () => {
    vastChain = [
      {
        ad: inlineAd,
        errorCode: null,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastInlineXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastWrapperXML
      }
    ];
    videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
    const {videoElement} = videoAdContainer;

    Object.defineProperty(videoElement, 'error', {
      value: undefined,
      writable: true
    });
  });

  afterEach(() => {
    vastChain = null;
    videoAdContainer = null;

    jest.clearAllMocks();
    retrieveIcons.mockReset();
  });

  test('must set the initial state with the data passed to the constructor', () => {
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    expect(adUnit.vastChain).toBe(vastChain);
    expect(adUnit.videoAdContainer).toBe(videoAdContainer);
    expect(adUnit.error).toEqual(null);
    expect(adUnit.errorCode).toEqual(null);
    expect(adUnit.assetUri).toEqual(null);
  });

  test('must set the metric listeners passing the needed data', async () => {
    metricHandlers.forEach((handler) => handler.mockClear());
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    metricHandlers.forEach((handler) => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        videoAdContainer,
        expect.any(Function),
        {
          clickThroughUrl: 'https://test.example.com/clickthrough',
          progressEvents: [{offset: 5000,
            uri: 'https://test.example.com/progress'
          },
          {
            offset: '15%',
            uri: 'https://test.example.com/progress2'
          },
          {
            offset: 5000,
            uri: 'https://test.example.com/progress'
          },
          {
            offset: '15%',
            uri: 'https://test.example.com/progress2'
          }

          ],
          skipoffset: 5000
        }
      );
    });
  });

  test('must be possible to pass a createSkipOffset hook to the handlers', async () => {
    metricHandlers.forEach((handler) => handler.mockClear());
    canPlay.mockReturnValue(true);
    const createSkipOffset = jest.fn();
    const adUnit = new VastAdUnit(vastChain, videoAdContainer, {
      hooks: {createSkipOffset}
    });

    await adUnit.start();

    metricHandlers.forEach((handler) => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        videoAdContainer,
        expect.any(Function),
        {
          clickThroughUrl: 'https://test.example.com/clickthrough',
          createSkipOffset,
          progressEvents: expect.any(Array),
          skipoffset: 5000
        }
      );
    });
  });

  test('must add the icons of the vastChain', async () => {
    canPlay.mockReturnValue(true);
    const icons = [{
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }];
    let adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(retrieveIcons).toHaveBeenCalledTimes(1);
    expect(addIcons).not.toHaveBeenCalled();

    retrieveIcons.mockImplementation(() => icons);
    adUnit = new VastAdUnit(vastChain, videoAdContainer);

    expect(retrieveIcons).toHaveBeenCalledTimes(2);
    expect(addIcons).toHaveBeenCalledTimes(1);

    await adUnit.start();
    expect(mockDrawIcons).toHaveBeenCalledTimes(1);

    expect(addIcons).toHaveBeenCalledWith(icons, {
      logger: adUnit.logger,
      onIconClick: expect.any(Function),
      onIconView: expect.any(Function),
      videoAdContainer
    });
  });

  test('passed iconView must emit iconView passing the event, this and the viewed icon', async () => {
    canPlay.mockReturnValue(true);
    const icons = [{
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }];

    retrieveIcons.mockImplementation(() => icons);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(addIcons).toHaveBeenCalledTimes(1);

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
      data: icons[0],
      type: iconView
    }]);
  });

  test('passed iconClick must emit iconClick passing the event, this and the viewed icon', async () => {
    canPlay.mockReturnValue(true);
    const icons = [{
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }];

    retrieveIcons.mockImplementation(() => icons);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(addIcons).toHaveBeenCalledTimes(1);

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
      data: icons[0],
      type: iconClick
    }]);
  });

  test('start emit an error if there is no suitable mediaFile to play', async () => {
    canPlay.mockReturnValue(false);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer, {logger: {error: () => {}}
    });
    const errorHandler = jest.fn();
    const onErrorCallback = jest.fn();
    const errorPromise = new Promise((resolve) => {
      adUnit.on(errorEvt, (...args) => {
        resolve(args);
      });
    });

    adUnit.on(errorEvt, errorHandler);
    adUnit.onError(() => {
      throw new Error('boom');
    });
    adUnit.onError(onErrorCallback);
    await adUnit.start();
    await errorPromise;

    expect(adUnit.error).toBeInstanceOf(Error);
    expect(adUnit.error.message).toBe('Can\'t find a suitable media to play');
    expect(adUnit.errorCode).toBe(403);
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith({
      adUnit,
      type: errorEvt
    });
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(onErrorCallback).toHaveBeenCalledWith(adUnit.error);
  });

  test('start must select a mediaFile and update the src and the assetUri', async () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');
    expect(videoAdContainer.videoElement.src).toBe(adUnit.assetUri);
  });

  test('start must select the best media to play', async () => {
    canPlay.mockReturnValue(true);
    Object.defineProperty(videoAdContainer.element, 'getBoundingClientRect', {
      value: () => ({
        height: 504,
        width: 896
      }),
      writable: true
    });
    let adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(adUnit.assetUri).toBe('https://test.example.com/test768x432.mp4');

    videoAdContainer.element.getBoundingClientRect = () => ({
      height: 300,
      width: 200
    });
    adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');

    videoAdContainer.element.getBoundingClientRect = () => ({
      height: 1000,
      width: 2000
    });
    adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(adUnit.assetUri).toBe('https://test.example.com/test1920x1080.mp4');
  });

  test('start must play the selected mediaFile', async () => {
    canPlay.mockReturnValue(true);
    Object.defineProperty(videoAdContainer.videoElement, 'play', {
      value: jest.fn()
    });
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(videoAdContainer.videoElement.play).toHaveBeenCalledTimes(1);
  });

  test('start must throw if called twice', async () => {
    expect.assertions(1);
    canPlay.mockReturnValue(true);
    Object.defineProperty(videoAdContainer.videoElement, 'play', {
      value: jest.fn()
    });
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    try {
      await adUnit.start();
    } catch (error) {
      expect(error.message).toBe('VastAdUnit already started');
    }
  });

  test('VastAdUnit `cancel` must throw if you call it on a finished adUnit', async () => {
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();
    adUnit.cancel();

    expect(() => adUnit.cancel()).toThrowError('VideoAdUnit is finished');
  });

  test('`start` must throw if you call it on a finished adUnit', async () => {
    expect.assertions(1);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    adUnit.cancel();

    try {
      await adUnit.start();
    } catch (error) {
      expect(error.message).toBe('VideoAdUnit is finished');
    }
  });

  test('cancel must stop the ad video and finish the ad unit', () => {
    canPlay.mockReturnValue(true);
    Object.defineProperty(videoAdContainer.videoElement, 'pause', {
      value: jest.fn()
    });
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    adUnit.start();

    expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(0);
    expect(adUnit.isFinished()).toBe(false);

    adUnit.cancel();

    expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(1);
    expect(adUnit.isFinished()).toBe(true);
  });

  test('onFinish must complain if you don\'t pass a callback', () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    expect(() => adUnit.onFinish()).toThrow(TypeError);
    expect(() => adUnit.onFinish()).toThrow('Expected a callback function');
  });

  test('onFinish must call the passed callback once the ad has completed', () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer, {logger: {error: () => {}}});
    const callback = jest.fn();

    adUnit.onFinish(() => {
      throw new Error('boom');
    });

    adUnit.onFinish(callback);
    adUnit.start();

    expect(callback).not.toHaveBeenCalled();

    videoAdContainer.videoElement.dispatchEvent(new Event('ended'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(adUnit.isFinished()).toBe(true);
  });

  test('onFinish must call the passed callback if the ad is cancelled', () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer, {logger: {error: () => {}}});
    const callback = jest.fn();

    adUnit.onFinish(() => {
      throw new Error('boom');
    });

    adUnit.onFinish(callback);
    adUnit.start();

    expect(callback).not.toHaveBeenCalled();

    adUnit.cancel();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(adUnit.isFinished()).toBe(true);
  });

  test('onError must complain if you don\'t pass a callback', () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    expect(() => adUnit.onError()).toThrow(TypeError);
    expect(() => adUnit.onError()).toThrow('Expected a callback function');
  });

  test('onError must be called if there was an issue viewing the ad', async () => {
    canPlay.mockReturnValue(true);
    const {videoElement} = videoAdContainer;
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);
    const callback = jest.fn();
    const mediaError = new Error('media error');

    videoElement.error = mediaError;
    adUnit.onError(callback);
    await adUnit.start();

    expect(callback).not.toHaveBeenCalled();

    videoElement.dispatchEvent(new Event('error'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mediaError);
    expect(adUnit.error).toBe(mediaError);
    expect(adUnit.errorCode).toBe(405);
    expect(adUnit.isFinished()).toBe(true);
  });

  test('must emit whatever metric event happens', async () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    const promise = new Promise((resolve) => {
      adUnit.on('custom', (...args) => {
        resolve(args);
      });
    });

    await adUnit.start();

    const data = {};
    const event = new CustomEvent('custom');

    event.data = data;
    videoAdContainer.videoElement.dispatchEvent(event);

    const passedArgs = await promise;

    expect(passedArgs).toEqual([{
      adUnit,
      type: 'custom'
    }]);
  });

  test('cancel must stop the metric handlers ', async () => {
    canPlay.mockReturnValue(true);
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();
    adUnit.cancel();

    expect(mockStopMetricHandler).toHaveBeenCalledTimes(metricHandlers.length);
  });

  test('cancel must remove the icons of the vastChain', async () => {
    canPlay.mockReturnValue(true);

    retrieveIcons.mockImplementation(() => [{
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }]);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();
    adUnit.cancel();

    expect(mockRemoveIcons).toHaveBeenCalledTimes(1);
  });

  [
    ['resume', 'play'],
    ['pause', 'pause']
  ].forEach(([method, vpMethod]) => {
    test(`VastAdUnit ${method} must call ${vpMethod} on the video element`, async () => {
      canPlay.mockReturnValue(true);
      const {videoElement} = videoAdContainer;

      Object.defineProperty(videoElement, vpMethod, {
        value: jest.fn()
      });

      const adUnit = new VastAdUnit(vastChain, videoAdContainer);

      await adUnit.start();

      videoElement[vpMethod].mockClear();

      adUnit[method]();
      expect(videoElement[vpMethod]).toHaveBeenCalledTimes(1);
    });
  });

  test('resize must not update the media if the ad has not started', async () => {
    canPlay.mockReturnValue(true);
    videoAdContainer.resize = jest.fn();
    retrieveIcons.mockImplementation(() => null);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();
    await adUnit.resize();

    expect(updateMedia).toHaveBeenCalledTimes(0);
  });

  test('resize update the media element if the ad has started and there is a better source for the new size', async () => {
    canPlay.mockReturnValue(true);
    videoAdContainer.resize = jest.fn();
    retrieveIcons.mockImplementation(() => null);

    const {videoElement} = videoAdContainer;
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();
    await adUnit.resize();

    expect(updateMedia).toHaveBeenCalledTimes(0);
    const bestSource = videoElement.src;

    videoElement.src = '';
    await adUnit.resize();

    expect(updateMedia).toHaveBeenCalledTimes(1);
    expect(updateMedia).toHaveBeenCalledWith(videoElement, expect.objectContaining({src: bestSource}));
  });

  test('must redraw the icons', async () => {
    canPlay.mockReturnValue(true);

    const icons = [{
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }];

    retrieveIcons.mockImplementation(() => icons);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(mockRemoveIcons).toHaveBeenCalledTimes(0);
    expect(mockDrawIcons).toHaveBeenCalledTimes(1);

    await adUnit.resize();

    expect(mockRemoveIcons).toHaveBeenCalledTimes(1);
    expect(mockDrawIcons).toHaveBeenCalledTimes(2);
  });

  test('setVolume must change the volume of the video element', async () => {
    canPlay.mockReturnValue(true);
    retrieveIcons.mockImplementation(() => null);
    const {videoElement} = videoAdContainer;

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(videoElement.volume).toBe(1);

    adUnit.setVolume(0.5);
    expect(videoElement.volume).toBe(0.5);
  });

  test('getVolume must return the volume of the video element', async () => {
    canPlay.mockReturnValue(true);
    retrieveIcons.mockImplementation(() => null);

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    await adUnit.start();

    expect(adUnit.getVolume()).toBe(1);

    adUnit.setVolume(0.5);
    expect(adUnit.getVolume()).toBe(0.5);
  });

  test('paused must return true if the ad is running and false otherwise', () => {
    canPlay.mockReturnValue(true);
    retrieveIcons.mockImplementation(() => null);

    const {videoElement} = videoAdContainer;
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    Object.defineProperty(videoElement, 'paused', {
      value: true,
      writable: true
    });

    expect(adUnit.paused()).toBe(true);

    videoElement.paused = false;

    expect(adUnit.paused()).toBe(false);
  });

  describe('duration', () => {
    test('must return 0 if the ad has not started', () => {
      canPlay.mockReturnValue(true);
      retrieveIcons.mockImplementation(() => null);

      const adUnit = new VastAdUnit(vastChain, videoAdContainer);

      expect(adUnit.duration()).toBe(0);
    });

    test('must return the videoElement duration', async () => {
      canPlay.mockReturnValue(true);
      retrieveIcons.mockImplementation(() => null);

      const adUnit = new VastAdUnit(vastChain, videoAdContainer);

      Object.defineProperty(videoAdContainer.videoElement, 'duration', {
        value: 30
      });

      expect(adUnit.duration()).toBe(0);

      await adUnit.start();

      expect(adUnit.duration()).toBe(30);
    });
  });

  describe('currentTime', () => {
    test('must return 0 if the ad has not started', () => {
      canPlay.mockReturnValue(true);
      retrieveIcons.mockImplementation(() => null);

      const adUnit = new VastAdUnit(vastChain, videoAdContainer);

      expect(adUnit.currentTime()).toBe(0);
    });

    test('must return the videoElement currentTime', async () => {
      canPlay.mockReturnValue(true);
      retrieveIcons.mockImplementation(() => null);

      const adUnit = new VastAdUnit(vastChain, videoAdContainer);

      Object.defineProperty(videoAdContainer.videoElement, 'currentTime', {
        value: 30
      });

      expect(adUnit.currentTime()).toBe(0);

      await adUnit.start();

      expect(adUnit.currentTime()).toBe(30);
    });
  });
});
