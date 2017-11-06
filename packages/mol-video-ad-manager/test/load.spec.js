import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd,
  inlineAd,
  inlineParsedXML,
  vastInlineXML
} from 'mol-vast-fixtures';
import {requestAd} from 'mol-vast-loader';
import load from '../src/load';
import trackError from '../src/helpers/trackError';

jest.mock('mol-vast-loader', () => ({requestAd: jest.fn()}));
jest.mock('../src/helpers/trackError', () => jest.fn());

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
  requestAd.mockClear();
  trackError.mockClear();
});

test('load must return the vastChain', async () => {
  requestAd.mockReturnValueOnce(Promise.resolve(successVastChain));
  const adTag = 'test.example.com/adTag';
  const options = {};
  const vastChain = await load(adTag, options);

  expect(vastChain).toBe(successVastChain);
  expect(requestAd).toHaveBeenCalledTimes(1);
  expect(requestAd).toBeCalledWith(adTag, options);
  expect(trackError).not.toHaveBeenCalled();
});

test('load must track the errors', async () => {
  requestAd.mockReturnValueOnce(Promise.resolve(errorVastChain));
  const adTag = 'test.example.com/adTag';
  const options = {};
  const vastChain = await load(adTag, options);

  expect(vastChain).toBe(errorVastChain);
  expect(requestAd).toHaveBeenCalledTimes(1);
  expect(requestAd).toBeCalledWith(adTag, options);
  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(errorVastChain, undefined);
});

test('load must pass the optional track to the trackErrors fn', async () => {
  requestAd.mockReturnValueOnce(Promise.resolve(errorVastChain));
  const adTag = 'test.example.com/adTag';
  const options = {
    track: () => {}
  };
  const vastChain = await load(adTag, options);

  expect(vastChain).toBe(errorVastChain);
  expect(requestAd).toHaveBeenCalledTimes(1);
  expect(requestAd).toBeCalledWith(adTag, options);
  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(errorVastChain, options.track);
});
