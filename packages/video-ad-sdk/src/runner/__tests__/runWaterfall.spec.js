import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures';
import requestAd from '../../vastRequest/requestAd';
import requestNextAd from '../../vastRequest/requestNextAd';
import run from '../run';
import runWaterfall from '../runWaterfall';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import VastAdUnit from '../../adUnit/VastAdUnit';

jest.mock('../../vastRequest/requestAd', () => jest.fn());
jest.mock('../../vastRequest/requestNextAd', () => jest.fn());
jest.mock('../run', () => jest.fn());

let adTag;
let vastAdChain;
let options;
let placeholder;
let adContainer;
let adUnit;

beforeEach(async () => {
  adTag = 'https://test.example.com/adtag';
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
    }
  ];
  options = {
    onError: jest.fn()
  };
  placeholder = document.createElement('div');
  adContainer = await new VideoAdContainer(placeholder, document.createElement('video')).ready();
  adUnit = new VastAdUnit(vastAdChain, adContainer, options);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test('runWaterfall must return the adUnit', async () => {
  requestAd.mockReturnValue(Promise.resolve(vastAdChain));
  run.mockReturnValue(Promise.resolve(adUnit));

  const res = await runWaterfall(adTag, placeholder, options);

  expect(res).toBe(adUnit);
  expect(requestAd).toHaveBeenCalledTimes(1);
  expect(requestAd).toHaveBeenCalledWith(adTag, options);
  expect(run).toHaveBeenCalledTimes(1);
  expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, options);
  expect(options.onError).not.toHaveBeenCalled();
});

test('runWaterfall must throw if the whole waterfall fails', async () => {
  const runError = new Error('Error running the ad');
  const requestError = new Error('Error with the request');

  run.mockReturnValue(Promise.reject(runError));
  requestAd.mockReturnValue(Promise.resolve(vastAdChain));
  requestNextAd.mockReturnValueOnce(Promise.resolve(vastAdChain));
  requestNextAd.mockReturnValueOnce(Promise.reject(requestError));

  try {
    await runWaterfall(adTag, placeholder, options);
  } catch (error) {
    expect(error).toBe(requestError);
    expect(requestAd).toHaveBeenCalledTimes(1);
    expect(requestAd).toHaveBeenCalledWith(adTag, options);
    expect(requestNextAd).toHaveBeenCalledTimes(2);
    expect(requestNextAd).toHaveBeenCalledWith(vastAdChain, options);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, options);
    expect(options.onError).toHaveBeenCalledTimes(3);
    expect(options.onError).toHaveBeenCalledWith(expect.objectContaining({
      error: runError,
      vastChain: vastAdChain
    }));
    expect(options.onError).toHaveBeenCalledWith(expect.objectContaining({
      error: requestError,
      vastChain: undefined
    }));
  }
});
