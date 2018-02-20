import {
  createVideoAdUnit
} from 'mol-video-ad-sdk';
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import {VideoAdContainer} from 'mol-video-ad-container';
import {VastAdUnit} from 'mol-video-ad-unit';
import startVideoAd from '../../src/helpers/startVideoAd';

jest.mock('mol-video-ad-sdk', () => ({
  createVideoAdUnit: jest.fn()
}));

const createAdUnitMock = (adChain, adContainer, opts) => {
  const vastAdUnit = new VastAdUnit(adChain, adContainer, opts);
  const errorCallbacks = [];

  vastAdUnit.onError = (handler) => errorCallbacks.push(handler);
  vastAdUnit.cancel = jest.fn();
  // eslint-disable-next-line id-match
  vastAdUnit.__simulateError = (error) => errorCallbacks.forEach((handler) => handler(error));

  return vastAdUnit;
};

let vastAdChain;
let videoAdContainer;
let options;

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
  const placeholder = document.createElement('div');

  videoAdContainer = await new VideoAdContainer(placeholder, {}).ready();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test('must fail if there is a problem creating the ad Unit', () => {
  expect.assertions(1);
  const adUnitError = new Error('AdUnit error');

  createVideoAdUnit.mockImplementation(() => {
    throw adUnitError;
  });

  return expect(startVideoAd(vastAdChain, videoAdContainer, options)).rejects.toBe(adUnitError);
});

test('must cancel the ad unit if there is an error starting it', async () => {
  expect.assertions(2);
  const adUnitError = new Error('adUnit error');
  const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

  createVideoAdUnit.mockImplementationOnce(() => {
    const promise = Promise.resolve(adUnit);

    // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    adUnit.start = () => {
      adUnit.__simulateError(adUnitError);
    };

    return promise;
  });

  await expect(startVideoAd(vastAdChain, videoAdContainer, options)).rejects.toBe(adUnitError);
  expect(adUnit.cancel).toHaveBeenCalledTimes(1);
});

test('must return the ad unit', async () => {
  expect.assertions(2);
  const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

  createVideoAdUnit.mockImplementationOnce(() => {
    const promise = Promise.resolve(adUnit);

    // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    adUnit.start = () => {
      adUnit.emit('start');
    };

    return promise;
  });

  await expect(startVideoAd(vastAdChain, videoAdContainer, options)).resolves.toBe(adUnit);
  expect(adUnit.cancel).toHaveBeenCalledTimes(0);
});
