/* eslint-disable id-match */
import {getAds} from 'mol-vast-selectors';
import {
  vastWrapperXML,
  vastInlineXML,
  vastWaterfallXML,
  wrapperParsedXML,
  inlineParsedXML,
  waterfallParsedXML,
  waterfallWithInlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import {requestNextAd} from '../src/index';

const markAdAsRequested = (ad) => {
  ad.___requested = true;
};

const unmarkAdAsRequested = (ad) => {
  delete ad.___requested;
};

test('requestNextAd must throw if we pass an invalid VAST chain', () => {
  expect(() => requestNextAd()).toThrowError('Invalid VAST chain');
  expect(() => requestNextAd()).toThrowError(TypeError);
});

test('requestNexAd must return the next inline to play in the waterfall', async () => {
  const waterfallAds = getAds(waterfallWithInlineParsedXML);
  const VASTWaterfallChain = [
    {
      ad: inlineAd,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[0],
      errorCode: null,
      parsedXML: waterfallWithInlineParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ];

  markAdAsRequested(inlineAd);
  markAdAsRequested(wrapperAd);
  markAdAsRequested(waterfallAds[0]);

  const vastChain = await requestNextAd(VASTWaterfallChain, {});

  expect(vastChain).toEqual([
    {
      ad: waterfallAds[1],
      errorCode: null,
      parsedXML: waterfallWithInlineParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ]);

  unmarkAdAsRequested(inlineAd);
  unmarkAdAsRequested(wrapperAd);
  unmarkAdAsRequested(waterfallAds[0]);
});

test('requestNextAd must request the next ad on the waterfall', async () => {
  const waterfallAds = getAds(waterfallParsedXML);
  const VASTWaterfallChain = [
    {
      ad: inlineAd,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[0],
      errorCode: null,
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ];

  const wrapperResponse = {
    status: 200,
    text: () => vastWrapperXML
  };

  const inlineResponse = {
    status: 200,
    text: () => vastInlineXML
  };

  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(inlineResponse))
    .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(inlineResponse));

  markAdAsRequested(inlineAd);
  markAdAsRequested(wrapperAd);
  markAdAsRequested(waterfallAds[0]);

  let vastChain = await requestNextAd(VASTWaterfallChain, {});

  expect(vastChain).toEqual([
    {
      ad: inlineAd,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[1],
      errorCode: null,
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ]);

  vastChain = await requestNextAd(vastChain, {});

  expect(vastChain).toEqual([
    {
      ad: inlineAd,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: waterfallAds[2],
      errorCode: null,
      parsedXML: waterfallParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWaterfallXML
    }
  ]);

  unmarkAdAsRequested(inlineAd);
  unmarkAdAsRequested(wrapperAd);
  unmarkAdAsRequested(waterfallAds[0]);
});

test('requestNextAd must throw an error if there are no more ads to play in the waterfall', () => {
  markAdAsRequested(inlineAd);
  markAdAsRequested(wrapperAd);

  const VASTChain = [
    {
      ad: inlineAd,
      errorCode: null,
      parsedXML: inlineParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastInlineXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    },
    {
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastWrapperXML
    }
  ];

  expect(() => requestNextAd(VASTChain, {})).toThrowError('No next ad to request');
  expect(() => requestNextAd(VASTChain, {})).toThrowError(Error);

  unmarkAdAsRequested(inlineAd);
  unmarkAdAsRequested(wrapperAd);
});

