import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import getVastError from '../../src/helpers/getVastError';

test('must return undefined if the vastchain has no error', () => {
  const vastChain = [
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

  expect(getVastError(vastChain)).toBeUndefined();
});

test('must return the error of the vastchain', () => {
  const mockError = new Error('mock error');
  const vastChain = [
    {
      ad: inlineAd,
      error: mockError,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastInlineXML
    }
  ];

  expect(getVastError(vastChain)).toBe(mockError);
});

test('must throw if you don\'t pass a valid vastChain', () => {
  expect(getVastError()).toBeInstanceOf(Error);
  expect(getVastError([])).toBeInstanceOf(Error);
});

