/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from 'mol-video-ad-tracker';
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import {createVideoAdContainer} from 'mol-video-ad-container';
import VastAdUnit from '../src/VastAdUnit';
import canPlay from '../src/helpers/media/canPlay';
import metricHandlers from '../src/helpers/metrics/handlers';
import addIcons from '../src/helpers/icons/addIcons';
import retrieveIcons from '../src/helpers/icons/retrieveIcons';

const {
  iconClick,
  iconView,
  error: errorEvt
} = linearEvents;
const mockStopMetricHandler = jest.fn();

jest.mock('../src/helpers/media/canPlay.js', () => jest.fn());
jest.mock('../src/helpers/metrics/handlers/index.js', () => [
  jest.fn(({videoElement}, callback) => {
    videoElement.addEventListener('ended', () => callback('complete'));
    videoElement.addEventListener('error', () => callback('error', videoElement.error));
    videoElement.addEventListener('progress', ({detail}) => callback('progress', detail));
    videoElement.addEventListener('custom', (event) => callback('custom', event.data));

    return mockStopMetricHandler;
  }),
  jest.fn(() => mockStopMetricHandler)
]);

jest.mock('../src/helpers/icons/addIcons.js', () => jest.fn());
jest.mock('../src/helpers/icons/retrieveIcons.js', () => jest.fn());

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

  addIcons.mockClear();
  retrieveIcons.mockClear();
  mockStopMetricHandler.mockClear();
});

test('VastAdUnit must set the initial state with the data passed to the constructor', () => {
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  expect(adUnit.vastChain).toBe(vastChain);
  expect(adUnit.videoAdContainer).toBe(videoAdContainer);
  expect(adUnit.error).toEqual(null);
  expect(adUnit.errorCode).toEqual(null);
  expect(adUnit.assetUri).toEqual(null);
});

test('VastAdUnit must set the metric listeners passing the needed data', () => {
  metricHandlers.forEach((handler) => handler.mockClear());
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

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

test('VastAdUnit must be possible to pass a createSkipOffset hook to the handlers', () => {
  metricHandlers.forEach((handler) => handler.mockClear());
  canPlay.mockReturnValue(true);
  const createSkipOffset = jest.fn();
  const adUnit = new VastAdUnit(vastChain, videoAdContainer, {
    hooks: {createSkipOffset}
  });

  adUnit.start();

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

test('VastAdUnit must add the icons of the vastChain', () => {
  canPlay.mockReturnValue(true);
  const icons = [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }];
  let adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(retrieveIcons).toHaveBeenCalledTimes(1);
  expect(addIcons).not.toHaveBeenCalled();

  retrieveIcons.mockImplementation(() => icons);
  adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(retrieveIcons).toHaveBeenCalledTimes(2);
  expect(addIcons).toHaveBeenCalledTimes(1);

  expect(addIcons).toHaveBeenCalledWith(icons, {
    logger: adUnit.logger,
    onIconClick: expect.any(Function),
    onIconView: expect.any(Function),
    videoAdContainer
  });
});

test('VastAdUnit passed iconView must emit iconView passing the event, this and the viewed icon', async () => {
  canPlay.mockReturnValue(true);
  const icons = [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }];
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  retrieveIcons.mockImplementation(() => icons);
  adUnit.start();

  expect(addIcons).toHaveBeenCalledTimes(1);

  const passedConfig = addIcons.mock.calls[0][1];

  const promise = new Promise((resolve) => {
    adUnit.on(iconView, (...args) => {
      resolve(args);
    });
  });

  passedConfig.onIconView(icons[0]);

  const passedArgs = await promise;

  expect(passedArgs).toEqual([iconView, adUnit, icons[0]]);
});

test('VastAdUnit passed iconClick must emiit iconClick passing the event, this and the viewed icon', async () => {
  canPlay.mockReturnValue(true);
  const icons = [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }];
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  retrieveIcons.mockImplementation(() => icons);
  adUnit.start();

  expect(addIcons).toHaveBeenCalledTimes(1);

  const passedConfig = addIcons.mock.calls[0][1];

  const promise = new Promise((resolve) => {
    adUnit.on(iconClick, (...args) => {
      resolve(args);
    });
  });

  passedConfig.onIconClick(icons[0]);

  const passedArgs = await promise;

  expect(passedArgs).toEqual([iconClick, adUnit, icons[0]]);
});

test('VastAdUnit start emit an error if there is no suitable mediaFile to play', async () => {
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
  adUnit.start();
  await errorPromise;

  expect(adUnit.error).toBeInstanceOf(Error);
  expect(adUnit.error.message).toBe('Can\'t find a suitable media to play');
  expect(adUnit.errorCode).toBe(403);
  expect(errorHandler).toHaveBeenCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(errorEvt, adUnit, adUnit.error);
  expect(onErrorCallback).toHaveBeenCalledTimes(1);
  expect(onErrorCallback).toHaveBeenCalledWith(adUnit, adUnit.error);
});

test('VastAdUnit start must select a mediaFile and update the src and the assetUri', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');
  expect(videoAdContainer.videoElement.src).toBe(adUnit.assetUri);
});

test('VastAdUnit start must select the best media to play', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.element, 'getBoundingClientRect', {
    value: () => ({
      height: 504,
      width: 896
    }),
    writable: true
  });
  let adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(adUnit.assetUri).toBe('https://test.example.com/test768x432.mp4');

  videoAdContainer.element.getBoundingClientRect = () => ({
    height: 300,
    width: 200
  });
  adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');

  videoAdContainer.element.getBoundingClientRect = () => ({
    height: 1000,
    width: 2000
  });
  adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(adUnit.assetUri).toBe('https://test.example.com/test1920x1080.mp4');
});

test('VastAdUnit start must play the selected mediaFile', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.videoElement, 'play', {
    value: jest.fn()
  });
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();

  expect(videoAdContainer.videoElement.play).toHaveBeenCalledTimes(1);
});

test('VastAdUnit start must do nothing on a second play', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.videoElement, 'play', {
    value: jest.fn()
  });
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();
  adUnit.start();
  adUnit.start();

  expect(videoAdContainer.videoElement.play).toHaveBeenCalledTimes(1);
});

[
  'start',
  'resume',
  'pause',
  'cancel',
  'onError',
  'onComplete'
].forEach((method) => {
  test(`VastAdUnit ${method} must throw if you try to start a destroyed adUnit`, () => {
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    adUnit.destroy();

    expect(() => adUnit[method]()).toThrowError('VastAdUnit has been destroyed');
  });
});

test('VastAdUnit cancel must stop the ad video and destroy the ad unit', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.videoElement, 'pause', {
    value: jest.fn()
  });
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.destroy = jest.fn();
  adUnit.start();

  expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(0);
  adUnit.cancel();

  expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(1);
  expect(adUnit.destroy).toHaveBeenCalledTimes(0);
});

test('VastAdUnit onComplete must complain if you don\'t pass a callback', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  expect(() => adUnit.onComplete()).toThrow(TypeError);
  expect(() => adUnit.onComplete()).toThrow('Expected a callback function');
});

test('VastAdUnit onComplete must call the passed callback once the ad has completed', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer, {logger: {error: () => {}}});
  const callback = jest.fn();

  adUnit.onComplete(() => {
    throw new Error('boom');
  });

  adUnit.onComplete(callback);
  adUnit.start();

  expect(callback).not.toHaveBeenCalled();

  videoAdContainer.videoElement.dispatchEvent(new Event('ended'));
  expect(callback).toHaveBeenCalledTimes(1);
});

test('VastAdUnit onError must complain if you don\'t pass a callback', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  expect(() => adUnit.onError()).toThrow(TypeError);
  expect(() => adUnit.onError()).toThrow('Expected a callback function');
});

test('VastAdUnit onError must be called if there was an issue viewing the ad', () => {
  canPlay.mockReturnValue(true);
  const {videoElement} = videoAdContainer;
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);
  const callback = jest.fn();
  const mediaError = new Error('media error');

  videoElement.error = mediaError;
  adUnit.onError(callback);
  adUnit.start();

  expect(callback).not.toHaveBeenCalled();

  videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(adUnit, mediaError);
  expect(adUnit.error).toBe(mediaError);
  expect(adUnit.errorCode).toBe(405);
});

test('VastAdUnit must emit whatever metric event happens', async () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  const promise = new Promise((resolve) => {
    adUnit.on('custom', (...args) => {
      resolve(args);
    });
  });

  adUnit.start();
  const data = {};
  const event = new CustomEvent('custom');

  event.data = data;
  videoAdContainer.videoElement.dispatchEvent(event);

  const passedArgs = await promise;

  expect(passedArgs).toEqual(['custom', adUnit, data]);
});

test('VastAdUnit destroy must remove the src from the videoElement, stop the metric handlers and set state to null', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();
  adUnit.destroy();

  expect(videoAdContainer.videoElement.src).toBe('');
  expect(adUnit.vastChain).toEqual(null);
  expect(adUnit.videoAdContainer).toEqual(null);
  expect(adUnit.error).toEqual(null);
  expect(adUnit.errorCode).toEqual(null);
  expect(adUnit.assetUri).toEqual(null);
  expect(mockStopMetricHandler).toHaveBeenCalledTimes(metricHandlers.length);
});

test('VastAdUnit destroy must remove the icons of the vastChain', () => {
  canPlay.mockReturnValue(true);

  const removeIconMock = jest.fn();

  retrieveIcons.mockImplementation(() => [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }]);

  addIcons.mockImplementation(() => removeIconMock);
  const adUnit = new VastAdUnit(vastChain, videoAdContainer);

  adUnit.start();
  adUnit.destroy();

  expect(removeIconMock).toHaveBeenCalledTimes(1);
});

[
  ['resume', 'play'],
  ['pause', 'pause']
].forEach(([method, vpMethod]) => {
  test(`VastAdUnit ${method} must throw if the ad unit has not started`, () => {
    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    expect(() => adUnit[method]()).toThrowError('VastAdUnit has not started');
  });

  test(`VastAdUnit ${method} must call ${vpMethod} on the video element`, () => {
    canPlay.mockReturnValue(true);
    Object.defineProperty(videoAdContainer.videoElement, vpMethod, {
      value: jest.fn()
    });

    const adUnit = new VastAdUnit(vastChain, videoAdContainer);

    adUnit.start();
    videoAdContainer.videoElement[vpMethod].mockClear();

    adUnit[method]();
    expect(videoAdContainer.videoElement[vpMethod]).toHaveBeenCalledTimes(1);
  });
});
