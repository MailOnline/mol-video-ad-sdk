import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd,
  hybridInlineAd,
  hybridInlineParsedXML,
  hybridInlineXML,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../../fixtures';
import createVideoAdUnit from '../../../adUnit/createVideoAdUnit';
import VastAdUnit from '../../../adUnit/VastAdUnit';
import VpaidAdUnit from '../../../adUnit/VpaidAdUnit';
import canPlay from '../../../adUnit/helpers/media/canPlay';
import VideoAdContainer from '../../../adContainer/VideoAdContainer';
import startVideoAd from '../startVideoAd';

jest.mock('../../../adUnit/createVideoAdUnit');
jest.mock('../../../adUnit/helpers/media/canPlay');

const createAdUnitMock = (adChain, adContainer, opts) => {
  const vastAdUnit = new VastAdUnit(adChain, adContainer, opts);
  const errorCallbacks = [];

  vastAdUnit.onError = (handler) => errorCallbacks.push(handler);
  vastAdUnit.cancel = jest.fn();
  // eslint-disable-next-line id-match
  vastAdUnit.__simulateError = (error) => errorCallbacks.forEach((handler) => handler(error));

  return vastAdUnit;
};
const createVPAIDAdUnitMock = (adChain, adContainer, opts) => {
  const vastAdUnit = new VpaidAdUnit(adChain, adContainer, opts);
  const errorCallbacks = [];

  vastAdUnit.onError = (handler) => errorCallbacks.push(handler);
  vastAdUnit.cancel = jest.fn();
  // eslint-disable-next-line id-match
  vastAdUnit.__simulateError = (error) => errorCallbacks.forEach((handler) => handler(error));

  return vastAdUnit;
};

describe('startVideoAd', () => {
  let vastAdChain;
  let hybridVastAdChain;
  let wrongVastAdChain;
  let vpaidAdChain;
  let videoAdContainer;
  let options;

  beforeEach(() => {
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
    hybridVastAdChain = [
      {
        ad: hybridInlineAd,
        errorCode: null,
        parsedXML: hybridInlineParsedXML,
        requestTag: 'https://test.example.com/hybridVAST',
        XML: hybridInlineXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ];
    vpaidAdChain = [
      {
        ad: vpaidInlineAd,
        errorCode: null,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/hybridVAST',
        XML: vastVpaidInlineXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      }
    ];
    wrongVastAdChain = [
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

    videoAdContainer = new VideoAdContainer(placeholder);
    canPlay.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('must complain if you don\'t pass a valid vastAdChain or videoAdContainer', () => {
    expect(startVideoAd()).rejects.toBeInstanceOf(TypeError);
    expect(startVideoAd([])).rejects.toBeInstanceOf(TypeError);
    expect(startVideoAd(vastAdChain)).rejects.toBeInstanceOf(TypeError);
    expect(startVideoAd(vastAdChain, {})).rejects.toBeInstanceOf(TypeError);
  });

  test('must fail if there is a problem creating the ad Unit', () => {
    expect.assertions(1);
    const adUnitError = new Error('AdUnit error');

    createVideoAdUnit.mockImplementation(() => {
      throw adUnitError;
    });

    return expect(startVideoAd(vastAdChain, videoAdContainer, options)).rejects.toBe(adUnitError);
  });

  test('must fail if the ad chain has no creatives', async () => {
    expect.assertions(1);
    try {
      await startVideoAd(wrongVastAdChain, videoAdContainer, options);
    } catch (error) {
      expect(error.message).toBe('No valid creative found in the passed VAST chain');
    }
  });

  test('must cancel the ad unit if there is an error starting it', () => {
    expect.assertions(1);
    const adUnitError = new Error('adUnit error');
    const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

    createVideoAdUnit.mockImplementation(() => {
    // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
      adUnit.start = () => {
        adUnit.__simulateError(adUnitError);
      };

      return adUnit;
    });

    expect(startVideoAd(vastAdChain, videoAdContainer, options)).rejects.toBe(adUnitError);
  });

  test('must cancel the ad unit if there is an error starting the VPAID ad unit', async () => {
    expect.assertions(3);
    canPlay.mockReturnValue(false);
    const adUnitError = new Error('adUnit error');
    const adUnit = createVPAIDAdUnitMock(vpaidAdChain, videoAdContainer, options);

    createVideoAdUnit.mockImplementation(() => {
    // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
      adUnit.start = () => {
        adUnit.__simulateError(adUnitError);
      };

      return adUnit;
    });

    try {
      await startVideoAd(vpaidAdChain, videoAdContainer, options);
    } catch (error) {
      expect(error).toBe(adUnitError);
      expect(createVideoAdUnit).toBeCalledTimes(1);
      expect(createVideoAdUnit).toHaveBeenCalledWith(vpaidAdChain, videoAdContainer, {
        ...options,
        type: 'VPAID'
      });
    }
  });

  test('must return the ad unit', () => {
    expect.assertions(1);
    const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

    createVideoAdUnit.mockImplementation(() => {
    // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
      adUnit.start = () => {
        adUnit.emit('start');
      };

      return adUnit;
    });

    expect(startVideoAd(vastAdChain, videoAdContainer, options)).resolves.toBe(adUnit);
  });

  describe('with hybrid VAST responses (a response that has a VPAID and a VAST ad together', () => {
    test('must favor vpaid', () => {
      const vpaidUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

      createVideoAdUnit.mockImplementation(() => {
        // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
        vpaidUnit.start = () => {
          vpaidUnit.emit('start');
        };

        return vpaidUnit;
      });

      expect(startVideoAd(hybridVastAdChain, videoAdContainer, options)).resolves.toBe(vpaidUnit);
      expect(createVideoAdUnit).toHaveBeenCalledTimes(1);
      expect(createVideoAdUnit).toHaveBeenCalledWith(hybridVastAdChain, videoAdContainer, {
        ...options,
        type: 'VPAID'
      });
    });

    test('must fallback to VAST if VPAID fails', () => {
      const adUnitError = new Error('adUnit error');
      const adUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

      createVideoAdUnit.mockImplementationOnce(() => {
        const vpaidUnit = createAdUnitMock(vastAdChain, videoAdContainer, options);

        // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
        vpaidUnit.start = () => {
          vpaidUnit.__simulateError(adUnitError);
        };

        return vpaidUnit;
      })
        .mockImplementationOnce(() => {
        // eslint-disable-next-line promise/always-return, promise/always-return, promise/catch-or-return, promise/prefer-await-to-then

          adUnit.start = () => {
            adUnit.emit('start');
          };

          return adUnit;
        });

      expect(startVideoAd(hybridVastAdChain, videoAdContainer, options)).resolves.toBe(adUnit);
    });
  });
});
