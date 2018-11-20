/* eslint-disable max-nested-callbacks */
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures';
import defer from '../../utils/defer';
import requestAd from '../../vastRequest/requestAd';
import requestNextAd from '../../vastRequest/requestNextAd';
import run from '../run';
import runWaterfall from '../runWaterfall';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import VastAdUnit from '../../adUnit/VastAdUnit';
import {trackError} from '../../tracker';
import {_protected} from '../../adUnit/VideoAdUnit';

jest.mock('../../vastRequest/requestAd', () => jest.fn());
jest.mock('../../vastRequest/requestNextAd', () => jest.fn());
jest.mock('../run', () => jest.fn());
jest.mock('../../tracker', () => ({
  linearEvents: {},
  trackError: jest.fn()
}));

describe('runWaterfall', () => {
  let adTag;
  let vastAdChain;
  let options;
  let placeholder;
  let adContainer;
  let adUnit;

  beforeEach(() => {
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
      tracker: jest.fn()
    };
    placeholder = document.createElement('div');
    adContainer = new VideoAdContainer(placeholder, document.createElement('video'));
    adUnit = new VastAdUnit(vastAdChain, adContainer, options);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('after fetching Vast response', () => {
    test('must call onError if Vast response is undefined', async () => {
      const onError = jest.fn();

      requestAd.mockReturnValue(Promise.resolve());

      await runWaterfall(adTag, placeholder, {
        ...options,
        onError
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0].message).toBe('Invalid VastChain');
    });

    test('must call onError if Vast response is an empty array', async () => {
      const onError = jest.fn();

      requestAd.mockReturnValue(Promise.resolve([]));

      await runWaterfall(adTag, placeholder, {
        ...options,
        onError
      });
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0].message).toBe('Invalid VastChain');
    });

    test('must throw if the vastChain has an error and track the error', async () => {
      const onError = jest.fn();
      const vastChainError = new Error('boom');
      const vastChainWithError = [{
        ...vastAdChain[0],
        error: vastChainError,
        errorCode: 900
      }];

      requestAd.mockReturnValue(Promise.resolve(vastChainWithError));

      await runWaterfall(adTag, placeholder, {
        ...options,
        onError
      });
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBe(vastChainError);
      expect(trackError).toHaveBeenCalledWith(vastChainWithError, expect.objectContaining({
        errorCode: 900,
        tracker: options.tracker
      }));
    });

    test('must throw if options.hooks.validateVastResponse fails', async () => {
      const onError = jest.fn();
      const vastChainError = new Error('boom');

      vastChainError.errorCode = 900;

      requestAd.mockReturnValue(Promise.resolve(vastAdChain));

      await runWaterfall(adTag, placeholder, {
        ...options,
        hooks: {
          validateVastResponse: () => {
            throw vastChainError;
          }
        },
        onError
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBe(vastChainError);
      expect(trackError).toHaveBeenCalledWith(vastAdChain, expect.objectContaining({
        errorCode: 900,
        tracker: options.tracker
      }));
    });

    test('must be possible to transform the vast response before calling run', async () => {
      const deferred = defer();

      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const onAdStart = jest.fn();

      runWaterfall(adTag, placeholder, {
        ...options,
        hooks: {
          transformVastResponse: (vastResponse) => {
            // eslint-disable-next-line id-match
            vastResponse.__transformed = true;

            return vastResponse;
          }
        },
        onAdStart: (...args) => {
          deferred.resolve();
          onAdStart(...args);
        }
      });

      await deferred.promise;

      expect(onAdStart).toHaveBeenCalledTimes(1);
      expect(onAdStart).toHaveBeenCalledWith(adUnit);
      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(requestAd).toHaveBeenCalledWith(adTag, expect.objectContaining(options));
      expect(run).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.objectContaining(options));
      expect(vastAdChain.__transformed).toBe(true);
    });
  });

  describe('options.onAdStart', () => {
    test('must be called once the adUnit starts with the started ad unit', async () => {
      const deferred = defer();

      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const onAdStart = jest.fn();

      runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: (...args) => {
          deferred.resolve();
          onAdStart(...args);
        }
      });

      await deferred.promise;

      expect(onAdStart).toHaveBeenCalledTimes(1);
      expect(onAdStart).toHaveBeenCalledWith(adUnit);
      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(requestAd).toHaveBeenCalledWith(adTag, expect.objectContaining(options));
      expect(run).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.objectContaining(options));
    });
  });

  describe('options.onError', () => {
    test('must be called if there is an error with the waterfall', async () => {
      const runError = new Error('Error running the ad');
      const requestError = new Error('Error with the request');
      const onError = jest.fn();
      const deferred = defer();

      run.mockReturnValue(Promise.reject(runError));
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.reject(requestError));

      runWaterfall(adTag, placeholder, {
        onError,
        onRunFinish: () => deferred.resolve()
      });

      await deferred.promise;

      expect(onError).toHaveBeenCalledTimes(3);
      expect(onError).toHaveBeenCalledWith(runError);
      expect(onError).toHaveBeenCalledWith(requestError);
      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(requestAd).toHaveBeenCalledWith(adTag, expect.any(Object));
      expect(requestNextAd).toHaveBeenCalledTimes(2);
      expect(requestNextAd).toHaveBeenCalledWith(vastAdChain, expect.any(Object));
      expect(run).toHaveBeenCalledTimes(2);
      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.any(Object));
    });

    test('must be called if there is an error with the ad unit', async () => {
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const deferred = defer();
      const onError = jest.fn();

      adUnit.onError = jest.fn();

      runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve(),
        onError
      });
      await deferred.promise;

      const simulateAdUnitError = adUnit.onError.mock.calls[0][0];
      const mockError = new Error('mock error');

      simulateAdUnitError(mockError);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('options.onRunFinish', () => {
    test('must be called once the ad run finishes', async () => {
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const deferred = defer();
      const onRunFinish = jest.fn();

      runWaterfall(adTag, placeholder, {
        ...options,
        onRunFinish: () => {
          deferred.resolve();
          onRunFinish();
        }
      });
      adUnit[_protected].finish();
      await deferred.promise;

      expect(onRunFinish).toHaveBeenCalledTimes(1);
    });

    test('must be called if there is an error with the waterfall', async () => {
      const runError = new Error('Error running the ad');
      const requestError = new Error('Error with the request');
      const onRunFinish = jest.fn();
      const deferred = defer();

      run.mockReturnValue(Promise.reject(runError));
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.reject(requestError));

      runWaterfall(adTag, placeholder, {
        onRunFinish: () => {
          deferred.resolve();
          onRunFinish();
        }
      });
      await deferred.promise;

      expect(onRunFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('with timeout', () => {
    let origDateNow;

    beforeEach(() => {
      origDateNow = Date.now;
      Date.now = jest.fn();
    });

    afterEach(() => {
      Date.now = origDateNow;
    });

    test('must update the timeout', async () => {
      const deferred = defer();
      const opts = {
        timeout: 1000
      };

      Date.now.mockReturnValueOnce(1000);
      Date.now.mockReturnValueOnce(1100);

      run.mockReturnValue(Promise.resolve(adUnit));
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));

      runWaterfall(adTag, placeholder, {
        ...opts,
        onAdStart: () => deferred.resolve()
      });

      await deferred.promise;

      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(requestAd).toHaveBeenCalledWith(adTag, expect.objectContaining({
        ...opts,
        timeout: 1000
      }));

      expect(run).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.objectContaining({
        ...opts,
        timeout: 900
      }));
    });

    test('must update the timeout with each loop', async () => {
      const deferred = defer();
      const runError = new Error('Error running the ad');
      const requestError = new Error('Error with the request');
      const opts = {
        timeout: 1000
      };

      Date.now.mockReturnValueOnce(1000);
      Date.now.mockReturnValueOnce(1100);
      Date.now.mockReturnValueOnce(1200);
      Date.now.mockReturnValueOnce(1300);
      Date.now.mockReturnValueOnce(1400);
      Date.now.mockReturnValueOnce(1500);
      Date.now.mockReturnValueOnce(1600);

      run.mockReturnValue(Promise.reject(runError));
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.resolve(vastAdChain));
      requestNextAd.mockReturnValueOnce(Promise.reject(requestError));

      runWaterfall(adTag, placeholder, {
        ...opts,
        onRunFinish: () => deferred.resolve()
      });

      await deferred.promise;

      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(requestNextAd).toHaveBeenCalledTimes(2);
      expect(run).toHaveBeenCalledTimes(2);

      expect(requestAd).toHaveBeenCalledWith(adTag, expect.objectContaining({
        timeout: 1000
      }));

      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.objectContaining({
        timeout: 900
      }));

      expect(requestNextAd).toHaveBeenCalledWith(vastAdChain, expect.objectContaining({
        timeout: 800
      }));

      expect(run).toHaveBeenCalledWith(vastAdChain, placeholder, expect.objectContaining({
        timeout: 700
      }));

      expect(requestNextAd).toHaveBeenCalledWith(vastAdChain, expect.objectContaining({
        timeout: 600
      }));
    });
  });

  describe('cancel fn', () => {
    test('if called while fetching the vast chain, must prevent the ad run', async () => {
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const deferred = defer();

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onRunFinish: () => deferred.resolve()
      });

      cancelWaterfall();
      await deferred.promise;

      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(run).not.toHaveBeenCalled();
    });

    test('if called while starting the adUnit it must cancel the ad unit and call onRunFinish', async () => {
      // eslint-disable-next-line prefer-const
      let cancelWaterfall;

      jest.spyOn(adUnit, 'cancel');
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockImplementation(() => {
        cancelWaterfall();

        return Promise.resolve(adUnit);
      });

      const deferred = defer();
      const onAdStart = jest.fn();

      cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart,
        onRunFinish: () => deferred.resolve()
      });

      await deferred.promise;

      expect(requestAd).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledTimes(1);
      expect(onAdStart).not.toHaveBeenCalled();
      expect(adUnit.cancel).toHaveBeenCalledTimes(1);
    });

    test('if called after an ad unit started it must cancel the ad unit.', async () => {
      const deferred = defer();

      jest.spyOn(adUnit, 'cancel');
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onAdStart: () => deferred.resolve()
      });

      await deferred.promise;
      expect(adUnit.cancel).not.toHaveBeenCalled();

      cancelWaterfall();
      expect(adUnit.cancel).toHaveBeenCalledTimes(1);
    });

    test('if called after the ad run finished, it must do nothing', async () => {
      requestAd.mockReturnValue(Promise.resolve(vastAdChain));
      run.mockReturnValue(Promise.resolve(adUnit));
      jest.spyOn(adUnit, 'cancel');

      const deferred = defer();
      const onRunFinish = jest.fn();

      const cancelWaterfall = runWaterfall(adTag, placeholder, {
        ...options,
        onRunFinish: () => {
          deferred.resolve();
          onRunFinish();
        }
      });

      adUnit[_protected].finish();
      await deferred.promise;

      expect(adUnit.cancel).not.toHaveBeenCalled();

      cancelWaterfall();
      expect(adUnit.cancel).toHaveBeenCalledTimes(0);
    });
  });
});
