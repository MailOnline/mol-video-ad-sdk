/* eslint-disable promise/prefer-await-to-callbacks */
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
import canPlay from '../src/helpers/utils/canPlay';
import metricHandlers from '../src/helpers/metrics/handlers';
import {
  iconClick,
  iconView
} from '../src/helpers/metrics/linearTrackingEvents';
import {
  addIcons,
  retrieveIcons
} from '../src/helpers/icons';

const mockStopMetricHandler = jest.fn();

jest.mock('../src/helpers/utils/canPlay.js', () => jest.fn());
jest.mock('../src/helpers/metrics/handlers/index.js', () => [
  jest.fn(({videoElement}, callback) => {
    videoElement.addEventListener('ended', () => callback('complete'));
    videoElement.addEventListener('error', () => callback('error'));
    videoElement.addEventListener('progress', ({detail}) => callback('progress', detail));
    videoElement.addEventListener('custom', (event) => callback('custom', event.data));

    return mockStopMetricHandler;
  }),
  jest.fn(() => mockStopMetricHandler)
]);

jest.mock('../src/helpers/icons/index.js', () => ({
  addIcons: jest.fn(),
  retrieveIcons: jest.fn()
}));

let vastAdChain;
let videoAdContainer;

const createProgressEvent = (data) => new CustomEvent('progress', {detail: data});

beforeEach(async () => {
  vastAdChain = [
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
});

afterEach(() => {
  vastAdChain = null;
  videoAdContainer = null;

  addIcons.mockClear();
  retrieveIcons.mockClear();
});

test('VastAdUnit must set the initial state with the data passed to the constructor', () => {
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  expect(adUnit.vastAdChain).toBe(vastAdChain);
  expect(adUnit.videoAdContainer).toBe(videoAdContainer);
  expect(adUnit.error).toEqual(null);
  expect(adUnit.errorCode).toEqual(null);
  expect(adUnit.assetUri).toEqual(null);
  expect(adUnit.contentplayhead).toEqual(null);
});

test('VastAdUnit run must throw and error if there is no suitable mediaFile to play', () => {
  canPlay.mockReturnValue(false);
  let adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  expect(() => adUnit.run()).toThrowError('Can\'t find a suitable media to play');

  canPlay.mockReturnValue(true);
  adUnit = new VastAdUnit([
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWrapperXML
    }
  ], videoAdContainer);

  expect(() => adUnit.run()).toThrowError('Can\'t find a suitable media to play');
});

test('VastAdUnit run must select a mediaFile and update the src and the assetUri', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');
  expect(videoAdContainer.videoElement.src).toBe(adUnit.assetUri);
});

test('VastAdUnit run must select the best media to play', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.element, 'getBoundingClientRect', {
    value: () => ({
      height: 504,
      width: 896
    }),
    writable: true
  });
  let adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(adUnit.assetUri).toBe('https://test.example.com/test768x432.mp4');

  videoAdContainer.element.getBoundingClientRect = () => ({
    height: 300,
    width: 200
  });
  adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(adUnit.assetUri).toBe('https://test.example.com/test640x362.mp4');

  videoAdContainer.element.getBoundingClientRect = () => ({
    height: 1000,
    width: 2000
  });
  adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(adUnit.assetUri).toBe('https://test.example.com/test1920x1080.mp4');
});

test('VastAdUnit run must start the metric listeners', () => {
  metricHandlers.forEach((handler) => handler.mockClear());
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  metricHandlers.forEach((handler) => {
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      videoAdContainer,
      expect.any(Function),
      {
        clickThroughUrl: 'https://test.example.com/clickthrough',
        skipoffset: 5000
      }
    );
  });
});

test('VastAdUnit must be possible to pass a createSkipOffset hook to the handlers', () => {
  metricHandlers.forEach((handler) => handler.mockClear());
  canPlay.mockReturnValue(true);
  const createSkipOffset = jest.fn();
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer, {
    hooks: {createSkipOffset}
  });

  adUnit.run();

  metricHandlers.forEach((handler) => {
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      videoAdContainer,
      expect.any(Function),
      {
        clickThroughUrl: 'https://test.example.com/clickthrough',
        createSkipOffset,
        skipoffset: 5000
      }
    );
  });
});

test('VastAdUnit run must play the selected mediaFile', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.videoElement, 'play', {
    value: jest.fn()
  });
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(videoAdContainer.videoElement.play).toHaveBeenCalledTimes(1);
});

test('VastAdUnit run must add the icons of the vastChain', () => {
  canPlay.mockReturnValue(true);
  const icons = [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }];
  let adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

  expect(retrieveIcons).toHaveBeenCalledTimes(1);
  expect(addIcons).not.toHaveBeenCalled();

  retrieveIcons.mockImplementation(() => icons);
  adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();

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
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  retrieveIcons.mockImplementation(() => icons);
  adUnit.run();

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
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  retrieveIcons.mockImplementation(() => icons);
  adUnit.run();

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

test('VastAdUnit cancel must stop the ad video and destroy the ad unit', () => {
  canPlay.mockReturnValue(true);
  Object.defineProperty(videoAdContainer.videoElement, 'pause', {
    value: jest.fn()
  });
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.destroy = jest.fn();
  adUnit.run();

  expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(0);
  adUnit.cancel();

  expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(1);
  expect(adUnit.destroy).toHaveBeenCalledTimes(0);
});

test('VastAdUnit onComplete must complain if you don\'t pass a callback', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  expect(() => adUnit.onComplete()).toThrow(TypeError);
  expect(() => adUnit.onComplete()).toThrow('Expected a callback function');
});

test('VastAdUnit onComplete must call the passed callback once the ad has completed', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);
  const callback = jest.fn();

  adUnit.onComplete(callback);
  adUnit.run();

  expect(callback).not.toHaveBeenCalled();

  videoAdContainer.videoElement.dispatchEvent(new Event('ended'));
  expect(callback).toHaveBeenCalledTimes(1);
});

test('VastAdUnit onError must complain if you don\'t pass a callback', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  expect(() => adUnit.onError()).toThrow(TypeError);
  expect(() => adUnit.onError()).toThrow('Expected a callback function');
});

test('VastAdUnit onError must be called if there was an issue viewing the ad', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);
  const callback = jest.fn();

  adUnit.onError(callback);
  adUnit.run();

  expect(callback).not.toHaveBeenCalled();

  videoAdContainer.videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(1);
});

test('VastAdUnit on progress must update the contentPlayhead', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();
  videoAdContainer.videoElement.dispatchEvent(createProgressEvent({
    accumulated: 1,
    contentplayhead: '00:00:01.000'
  }));

  expect(adUnit.contentplayhead).toBe('00:00:01.000');
});

test('VastAdUnit must emit whatever metric event happens', async () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  const promise = new Promise((resolve) => {
    adUnit.on('custom', (...args) => {
      resolve(args);
    });
  });

  adUnit.run();
  const data = {};
  const event = new CustomEvent('custom');

  event.data = data;
  videoAdContainer.videoElement.dispatchEvent(event);

  const passedArgs = await promise;

  expect(passedArgs).toEqual(['custom', adUnit, data]);
});

test('VastAdUnit destroy must remove the src from the videoElement, stop the metric handlers and set state to null', () => {
  canPlay.mockReturnValue(true);
  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);

  adUnit.run();
  adUnit.destroy();

  expect(videoAdContainer.videoElement.src).toBe('');
  expect(adUnit.vastAdChain).toEqual(null);
  expect(adUnit.videoAdContainer).toEqual(null);
  expect(adUnit.error).toEqual(null);
  expect(adUnit.errorCode).toEqual(null);
  expect(adUnit.assetUri).toEqual(null);
  expect(adUnit.contentplayhead).toEqual(null);
  expect(mockStopMetricHandler).toHaveBeenCalledTimes(metricHandlers.length);
});

test('VastAdUnit destroy must remove the icons of the vastChain', () => {
  canPlay.mockReturnValue(true);

  const adUnit = new VastAdUnit(vastAdChain, videoAdContainer);
  const removeIconMock = jest.fn();

  retrieveIcons.mockImplementation(() => [{
    height: 20,
    width: 20,
    xPosition: 'left',
    yPosition: 'top'
  }]);

  addIcons.mockImplementation(() => removeIconMock);

  adUnit.run();
  adUnit.destroy();

  expect(removeIconMock).toHaveBeenCalledTimes(1);
});
