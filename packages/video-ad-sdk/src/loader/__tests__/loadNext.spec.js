import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd,
  inlineAd,
  inlineParsedXML,
  vastInlineXML
} from '../../../fixtures';
import {trackError} from '../../tracker';
import loadNext from '../loadNext';
import requestNextAd from '../../vastRequest/requestNextAd';

jest.mock('../../vastRequest/requestNextAd', () => jest.fn());
jest.mock('../../tracker', () => ({trackError: jest.fn()}));

const errorVastChain = [
  {
    ad: null,
    error: expect.any(Error),
    errorCode: 203,
    parsedXML: noAdParsedXML,
    requestTag: 'https://test.example.com/vastadtaguri',
    XML: vastNoAdXML
  },
  {
    ad: wrapperAd,
    errorCode: null,
    parsedXML: wrapperParsedXML,
    requestTag: 'http://adtag.test.example.com',
    XML: vastWrapperXML
  }
];

const successVastChain = [
  {
    ad: inlineAd,
    error: null,
    errorCode: null,
    parsedXML: inlineParsedXML,
    requestTag: 'https://test.example.com/vastadtaguri',
    XML: vastInlineXML
  },
  {
    ad: wrapperAd,
    errorCode: null,
    parsedXML: wrapperParsedXML,
    requestTag: 'http://adtag.test.example.com',
    XML: vastWrapperXML
  }

];

afterEach(() => {
  requestNextAd.mockClear();
  trackError.mockClear();
});

test('loadNext must throw if you don\'t pass a valid vastResponse', () => {
  expect(loadNext()).rejects.toBeInstanceOf(TypeError);
  expect(loadNext(null)).rejects.toBeInstanceOf(TypeError);
  expect(loadNext({})).rejects.toBeInstanceOf(TypeError);
  expect(loadNext([])).rejects.toBeInstanceOf(TypeError);
});

test('loadNext must return the new vastChain', async () => {
  requestNextAd.mockReturnValueOnce(Promise.resolve(successVastChain));
  const options = {};
  const vastChain = await loadNext(successVastChain, options);

  expect(vastChain).toBe(successVastChain);
  expect(requestNextAd).toHaveBeenCalledTimes(1);
  expect(requestNextAd).toBeCalledWith(successVastChain, options);
  expect(trackError).not.toHaveBeenCalled();
});

test('loadNext must track whatever error may have happened', async () => {
  requestNextAd.mockReturnValueOnce(Promise.resolve(errorVastChain));
  const options = {};
  const vastChain = await loadNext(successVastChain, options);

  expect(vastChain).toBe(errorVastChain);
  expect(requestNextAd).toHaveBeenCalledTimes(1);
  expect(requestNextAd).toBeCalledWith(successVastChain, options);
  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(errorVastChain, {
    errorCode: errorVastChain[0].errorCode
  });
});

test('loadNext must accept an optional tracker function to track the error', async () => {
  requestNextAd.mockReturnValueOnce(Promise.resolve(errorVastChain));
  const options = {
    tracker: () => {}
  };
  const vastChain = await loadNext(successVastChain, options);

  expect(vastChain).toBe(errorVastChain);
  expect(requestNextAd).toHaveBeenCalledTimes(1);
  expect(requestNextAd).toBeCalledWith(successVastChain, options);
  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(errorVastChain, {
    errorCode: errorVastChain[0].errorCode,
    tracker: options.tracker
  });
});

