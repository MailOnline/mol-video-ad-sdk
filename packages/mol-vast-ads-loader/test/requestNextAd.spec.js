import {getAds} from 'mol-vast-selectors';
import requestNextAd from '../src/requestNextAd';
import {
  vastWrapperXML,
  vastInlineXML,
  vastWaterfallXML,
  wrapperParsedXML,
  inlineParsedXML,
  waterfallParsedXML,
  wrapperAd,
  inlineAd
} from './fixtures';

test('requestNextAd must throw if we pass an invalid VAST chain', () => {
  expect(() => requestNextAd()).toThrowError('Invalid VAST chain');
  expect(() => requestNextAd()).toThrowError(TypeError);
});

test('requestNextAd must play the next ad on the waterfall', async () => {
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

  // eslint-disable-next-line id-match
  inlineAd.___requested = true;
  // eslint-disable-next-line id-match
  wrapperAd.___requested = true;
  // eslint-disable-next-line id-match
  waterfallAds[0].___requested = true;

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
});

test('requestNextAd must throw an error if there are no more ads to play in the waterfall', () => {
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
});

test('requestNextAd must play the next ad on the adPod');
test('requestNextAd with useAdBuffet option flat set to true must request and ad from the adBuffet of the adPod');
test('requestNextAd with useAdBuffet option flat set to true must request the next ad on the adPod if there are no more adBuffets to serve');
test('requestNextAd must go to the waterfall if there are no more ads to play on the adpod');
test('requestNextAd must not use the waterfall if the `avoidWaterfall` option flag is set to true');

