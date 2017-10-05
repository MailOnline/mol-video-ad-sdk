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
import metricHandlers from '../src/helpers/metrics';

jest.mock('../src/helpers/canPlay.js', () => jest.fn());
jest.mock('../src/helpers/metrics/index.js', () => [
  jest.fn(),
  jest.fn()
]);

let vastAdChain;
let videoAdContainer;

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
    expect(handler).toHaveBeenCalledWith(videoAdContainer.videoElement, expect.any(Function));
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
  expect(adUnit.destroy).toHaveBeenCalledTimes(0);
  adUnit.cancel();

  expect(videoAdContainer.videoElement.pause).toHaveBeenCalledTimes(1);
  expect(adUnit.destroy).toHaveBeenCalledTimes(1);
});

test('VastAdUnit onComplete must complain if you don\'t pass a callback');
test('VastAdUnit onComplete must call the passed callback once the ad has completed');

test('VastAdUnit onError must complain if you don\'t pass a callback');
test('VastAdUnit onError must be called if there was an issue viewing the ad');

test('VastAdUnit progress must complain if you don`t pass an offset');
test('VastAdUnit progress must complain if you don`t pass a callback');
test('VastAdUnit progress must call the callback once the offset has passed');

test('VastAdUnit destroy must remove the src from the videoElement');
test('VastAdUnit destroy must remove the metric listeners');
test('VastAdUnit destroy must set everything to null');

