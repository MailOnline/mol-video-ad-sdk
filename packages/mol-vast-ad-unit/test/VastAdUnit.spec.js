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
import canPlay from '../src/helpers/canPlay';
import metricHandlers from '../src/helpers/metrics/handlers';

const mockStopMetricHandler = jest.fn();

jest.mock('../src/helpers/canPlay.js', () => jest.fn());
jest.mock('../src/helpers/metrics/handlers/index.js', () => [
  jest.fn(({videoElement}, callback) => {
    videoElement.addEventListener('ended', () => callback('complete'));
    videoElement.addEventListener('error', () => callback('error'));
    videoElement.addEventListener('progress', ({detail}) => callback('progress', detail));
    videoElement.addEventListener('custom', () => callback('custom'));

    return mockStopMetricHandler;
  }),
  jest.fn(() => mockStopMetricHandler)
]);

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
      expect.any(Function)
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
    adUnit.on('custom', resolve);
  });

  adUnit.run();
  videoAdContainer.videoElement.dispatchEvent(new CustomEvent('custom'));

  const triggeredEvent = await promise;

  expect(triggeredEvent).toBe('custom');
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

