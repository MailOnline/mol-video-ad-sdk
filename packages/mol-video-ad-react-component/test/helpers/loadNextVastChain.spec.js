import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import {loadNext} from 'mol-video-ad-sdk';
import loadNextVastChain from '../../src/helpers/loadNextVastChain';

jest.mock('mol-video-ad-sdk', () => ({loadNext: jest.fn()}));

const ErrorVastChain = [];
const successVastChain = [
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

afterEach(() => {
  loadNext.mockClear();
  loadNext.mockReset();
});

test('must return a promise', () => {
  expect(loadNextVastChain()).toBeInstanceOf(Promise);
});

test('must return the vasChain', async () => {
  const opts = {};

  loadNext.mockImplementation(() => Promise.resolve(successVastChain));
  const result = await loadNextVastChain(successVastChain, opts);

  expect(result).toBe(successVastChain);
  expect(loadNext).toHaveBeenCalledTimes(1);
  expect(loadNext).toHaveBeenCalledWith(successVastChain, opts);
});

test('must throw if there is a problem loading the chain', async () => {
  const loadError = new Error('BOOM');

  loadNext.mockImplementation(() => {
    throw loadError;
  });

  expect(loadNextVastChain()).rejects.toBe(loadError);
});

test('must throw if there is a problem on the returned vastChain', async () => {
  loadNext.mockImplementation(() => Promise.resolve(ErrorVastChain));

  expect(loadNextVastChain()).rejects.toBeInstanceOf(Error);
});
