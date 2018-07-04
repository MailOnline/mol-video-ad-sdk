import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures';
import {trackError} from '../../tracker';
import startVideoAd from '../helpers/startVideoAd';
import run from '../run';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import VastAdUnit from '../../adUnit/VastAdUnit';
import createVideoAdContainer from '../../adContainer/createVideoAdContainer';

jest.mock('../helpers/startVideoAd', () => jest.fn());
jest.mock('../../adContainer/createVideoAdContainer', () => jest.fn());
jest.mock('../../tracker', () => ({
  linearEvents: {},
  trackError: jest.fn()
}));

let vastAdChain;
let options;
let placeholder;
let adContainer;
let adUnit;

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
    }
  ];
  options = {
    tracker: jest.fn()
  };
  placeholder = document.createElement('div');
  adContainer = await new VideoAdContainer(placeholder, {videoElement: document.createElement('video')}).ready();
  adUnit = new VastAdUnit(vastAdChain, adContainer, options);
  createVideoAdContainer.mockImplementation(() => Promise.resolve(adContainer));
  startVideoAd.mockImplementation(() => Promise.resolve(adUnit));
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test('run must throw if the vastChain is not valid or empty', async () => {
  try {
    await run(undefined, placeholder, options);
  } catch (error) {
    expect(error.message).toBe('Invalid VastChain');
  }

  try {
    await run([], placeholder, options);
  } catch (error) {
    expect(error.message).toBe('Invalid VastChain');
  }
});

test('run must throw if the vastChain has an error and track the error', async () => {
  const vastChainError = new Error('boom');
  const vastChainWithError = [{
    ...vastAdChain[0],
    error: vastChainError,
    errorCode: 900
  }];

  try {
    await run(vastChainWithError, placeholder, options);
  } catch (error) {
    expect(error).toBe(vastChainError);
    expect(trackError).toHaveBeenCalledTimes(1);
    expect(trackError).toHaveBeenCalledWith(vastChainWithError, expect.objectContaining({
      errorCode: 900,
      tracker: options.tracker
    }));
  }
});

test('must return the started adUnit adUnit', async () => {
  expect(await run(vastAdChain, placeholder, options)).toBe(adUnit);
  expect(createVideoAdContainer).toHaveBeenCalledWith(placeholder, options);
  expect(startVideoAd).toHaveBeenCalledWith(vastAdChain, adContainer, options);
});

test('must destroy the adContainer if there is a problem starting the adUnit', async () => {
  const adUnitError = new Error('boom');

  adContainer.destroy = jest.fn();
  startVideoAd.mockImplementation(() => Promise.reject(adUnitError));

  try {
    await run(vastAdChain, placeholder, {});
  } catch (error) {
    expect(adContainer.destroy).toHaveBeenCalledTimes(1);
  }
});
