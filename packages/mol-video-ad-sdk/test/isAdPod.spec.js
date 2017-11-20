import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd,
  inlineAd,
  inlineParsedXML,
  podParsedXML,
  vastInlineXML,
  vastPodXML
} from 'mol-vast-fixtures';
import {getFirstAd} from 'mol-vast-selectors';
import isAdPod from '../src/isAdPod';

test('isAdPod must return true if the passed vastChain has an adPod', () => {
  const adPodVastChain = [
    {
      ad: inlineAd,
      error: null,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastInlineXML
    },
    {
      ad: getFirstAd(wrapperParsedXML),
      errorCode: null,
      parsedXML: podParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastPodXML
    }
  ];

  expect(isAdPod(adPodVastChain)).toBe(true);
});

test('isAdPod must return false if the passed vasChain has no adPod', () => {
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

  const nullVastChain = [
    {
      ad: null,
      error: null,
      errorCode: null,
      parsedXML: null,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: ''
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWrapperXML
    }
  ];

  expect(isAdPod(nullVastChain)).toBe(false);
  expect(isAdPod(errorVastChain)).toBe(false);
  expect(isAdPod(successVastChain)).toBe(false);
});

