import {
  createVideoAdContainer
} from '@mol/video-ad-sdk';
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '@mol/vast-fixtures';
import {VideoAdContainer} from '@mol/video-ad-container';
import {VastAdUnit} from '@mol/video-ad-unit';
import startVideoAd from '../startVideoAd';
import tryToStartAd from '../tryToStartAd';
import loadNextVastChain from '../loadNextVastChain';

jest.mock('@mol/video-ad-sdk', () => ({
  createVideoAdContainer: jest.fn()
}));

jest.mock('../loadNextVastChain', () => jest.fn());
jest.mock('../startVideoAd', () => jest.fn());

let vastAdChain;
let options;
let adContainer;
let placeholder;
let loadNextVastChainError;
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
    onError: jest.fn()
  };
  placeholder = document.createElement('div');
  adContainer = await new VideoAdContainer(placeholder, {}).ready();
  loadNextVastChainError = new Error('loadNextVastChainError');
  loadNextVastChain.mockImplementation(() => {
    throw loadNextVastChainError;
  });
  createVideoAdContainer.mockImplementation(() => Promise.resolve(adContainer));
  adUnit = new VastAdUnit(vastAdChain, adContainer, options);
  startVideoAd.mockImplementation(() => Promise.resolve(adUnit));
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test('must fail if there is a problem fetching the vastChain', () => {
  expect.assertions(1);
  const fetchError = new Error('Fetch chain error');

  return expect(tryToStartAd(() => Promise.reject(fetchError), placeholder, options)).rejects.toBe(fetchError);
});

test('must fail if there is a problem creating the ad container', async () => {
  expect.assertions(2);
  const fetchVastChain = () => Promise.resolve(vastAdChain);
  const createVideoAdContainerError = new Error('Create video ad container error');

  createVideoAdContainer.mockImplementation(() => {
    throw createVideoAdContainerError;
  });

  await expect(
    tryToStartAd(fetchVastChain, placeholder, options)
  ).rejects.toBe(loadNextVastChainError);

  expect(options.onError).toHaveBeenCalledWith(createVideoAdContainerError);
});

test('must fail if there is a problem starting the ad unit', async () => {
  expect.assertions(4);
  const fetchVastChain = () => Promise.resolve(vastAdChain);
  const startAdUnitError = new Error('Start video ad unit error');

  jest.spyOn(adContainer, 'destroy');

  startVideoAd.mockImplementation(() => {
    throw startAdUnitError;
  });

  await expect(
    tryToStartAd(fetchVastChain, placeholder, options)
  ).rejects.toBe(loadNextVastChainError);
  expect(options.onError).toHaveBeenCalledTimes(1);
  expect(options.onError).toHaveBeenCalledWith(startAdUnitError);
  expect(adContainer.destroy).toHaveBeenCalledTimes(1);
});

test('must return the ad unit', async () => {
  expect.assertions(2);
  const fetchVastChain = () => Promise.resolve(vastAdChain);

  await expect(
    tryToStartAd(fetchVastChain, placeholder, options)
  ).resolves.toBe(adUnit);
  expect(options.onError).toHaveBeenCalledTimes(0);
});
