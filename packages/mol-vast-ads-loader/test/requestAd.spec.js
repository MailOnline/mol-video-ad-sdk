/* eslint-disable id-match */
import xml2js from 'mol-vast-xml2js';
import {
  getAds,
  getFirstAd
} from 'mol-vast-selectors';
import requestAd from '../src/requestAd';
import markAsRequested from '../src/helpers/markAsRequested';
import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  vastInlineXML,
  vastPodXML,
  wrapperParsedXML,
  inlineParsedXML,
  podParsedXML,
  vastInvalidXML,
  vastInvalidParsedXML,
  wrapperAd,
  inlineAd
} from './fixtures';

const unmarkAsRequested = (ad) => {
  delete ad.___requested;
};

test('requestAd must return a chain with errorcode 304 if the wrapperLimit is reached', async () => {
  const vastChain = await requestAd('http://adtag.test.example.com', {wrapperLimit: 1}, [{}]);
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: expect.any(Error),
    errorCode: 304,
    parsedXML: null,
    requestTag: 'http://adtag.test.example.com',
    XML: null
  });
});

test('requestAd must return a chain with errorcode 304 if the default wrapperLimit is reached', async () => {
  const vastChain = await requestAd('http://adtag.test.example.com', {}, [{}, {}, {}, {}, {}]);
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: expect.any(Error),
    errorCode: 304,
    parsedXML: null,
    requestTag: 'http://adtag.test.example.com',
    XML: null
  });
});

test('requestAd must return a chain with error code 502 if there was an error fetching the ad', async () => {
  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: expect.any(Error),
    errorCode: 502,
    parsedXML: null,
    requestTag: 'http://adtag.test.example.com',
    XML: null
  });
});

test('requestAd must return a chain with error code 502 if there was an error extracting the text from the response', async () => {
  const noTextError = new Error('No text in the response');
  const response = {
    status: 200,
    text: () => {
      throw noTextError;
    }
  };

  global.fetch = jest.fn(() => Promise.resolve(response));
  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: noTextError,
    errorCode: 502,
    parsedXML: null,
    requestTag: 'http://adtag.test.example.com',
    XML: null
  });
});

test('requestAd must return a chain with error code 100 if there is a problem parsing the xml', async () => {
  const response = {
    status: 200,
    text: () => 'not xml'
  };

  global.fetch = jest.fn(() => Promise.resolve(response));
  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: expect.any(Error),
    errorCode: 100,
    parsedXML: null,
    requestTag: 'http://adtag.test.example.com',
    XML: 'not xml'
  });
});

test('requestAd must return a chain with error 303 if there is no ad in the VAST response', async () => {
  const response = {
    status: 200,
    text: () => vastNoAdXML
  };

  global.fetch = jest.fn(() => Promise.resolve(response));
  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    error: expect.any(Error),
    errorCode: 303,
    parsedXML: noAdParsedXML,
    requestTag: 'http://adtag.test.example.com',
    XML: vastNoAdXML
  });
});

test('requestAd must do do the wrapper chain requests until it finds an inline ad', async () => {
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
    .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(inlineResponse));

  const vastChain = await requestAd('http://adtag.test.example.com', {});

  markAsRequested(inlineAd);
  markAsRequested(wrapperAd);

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
      ad: wrapperAd,
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastWrapperXML
    }
  ]);

  unmarkAsRequested(inlineAd);
  unmarkAsRequested(wrapperAd);
});

test('requestAd must set errorCode 101 if neither wrapper neither inline can be find inside the ad', async () => {
  const invalidVastResponse = {
    status: 200,
    text: () => vastInvalidXML
  };

  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve(invalidVastResponse));

  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const ad = getAds(vastInvalidParsedXML)[0];

  markAsRequested(ad);

  expect(vastChain).toEqual([
    {
      ad: getAds(vastInvalidParsedXML)[0],
      error: expect.any(Error),
      errorCode: 101,
      parsedXML: vastInvalidParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastInvalidXML
    }
  ]);
});

test('requestAd must set errorCode 203 if the allowMultipleAds option is set to false and receives an ad pod', async () => {
  const startChain = [
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
      requestTag: 'http://adtag.test.example.com',
      XML: vastWrapperXML
    }
  ];

  const podResponse = {
    status: 200,
    text: () => vastPodXML
  };

  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve(podResponse));

  const vastChain = await requestAd('https://VASTAdTagURI.example.com', {allowMultipleAds: false}, startChain);
  const firstPodAd = getFirstAd(podParsedXML);

  markAsRequested(firstPodAd);

  expect(vastChain).toEqual([
    {
      ad: firstPodAd,
      error: expect.any(Error),
      errorCode: 203,
      parsedXML: podParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastPodXML
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
      requestTag: 'http://adtag.test.example.com',
      XML: vastWrapperXML
    }
  ]);
});

test('requestAd must set errorCode 203 if the wrapper comes with allowMultipleAds is set to false and receives an ad pod', async () => {
  const newWrapperXML = vastWrapperXML.replace('allowMultipleAds="true"', 'allowMultipleAds="false"');
  const parsedWrapperXML = xml2js(newWrapperXML);
  const newWrapperAd = getFirstAd(parsedWrapperXML);
  const wrapperResponse = {
    status: 200,
    text: () => newWrapperXML
  };

  const podResponse = {
    status: 200,
    text: () => vastPodXML
  };

  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve(wrapperResponse))
    .mockImplementationOnce(() => Promise.resolve(podResponse));

  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const firstPodAd = getFirstAd(podParsedXML);

  markAsRequested(firstPodAd);
  markAsRequested(newWrapperAd);

  expect(vastChain).toEqual([
    {
      ad: firstPodAd,
      error: expect.any(Error),
      errorCode: 203,
      parsedXML: podParsedXML,
      requestTag: 'https://VASTAdTagURI.example.com',
      XML: vastPodXML
    },
    {
      ad: newWrapperAd,
      errorCode: null,
      parsedXML: parsedWrapperXML,
      requestTag: 'http://adtag.test.example.com',
      XML: newWrapperXML
    }
  ]);
});
