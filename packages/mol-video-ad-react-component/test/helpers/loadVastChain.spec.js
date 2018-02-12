import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import {load} from 'mol-video-ad-sdk';
import loadVastChain from '../../src/helpers/loadVastChain';

jest.mock('mol-video-ad-sdk', () => ({load: jest.fn()}));

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
  load.mockClear();
  load.mockReset();
});

test('must return a promise', () => {
  expect(loadVastChain()).toBeInstanceOf(Promise);
});

test('must return the vasChain', async () => {
  const opts = {};

  load.mockImplementation(() => Promise.resolve(successVastChain));
  const result = await loadVastChain('testTag', opts);

  expect(result).toBe(successVastChain);
  expect(load).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledWith('testTag', opts);
});

test('must throw if there is a problem loading the chain', async () => {
  const loadError = new Error('BOOM');

  load.mockImplementation(() => {
    throw loadError;
  });

  await expect(loadVastChain()).rejects.toBe(loadError);
});

test('must throw if there is a problem on the returned vastChain', async () => {
  load.mockImplementation(() => Promise.resolve(ErrorVastChain));

  await expect(loadVastChain()).rejects.toBeInstanceOf(Error);
});
