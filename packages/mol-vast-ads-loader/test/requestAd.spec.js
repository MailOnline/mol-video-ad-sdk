import requestAd from '../src/requestAd';
import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from './fixtures';

test('requestAd must return a chain with errorcode 304 if the wrapperLimit is reached', async () => {
  const vastChain = await requestAd('http://adtag.test.example.com', {wrapperLimit: 1}, [{}]);
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
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
    XML: null
  });
});

test('requestAd must return a chain with error 300 if there is no ad in the VAST response', async () => {
  const response = {
    status: 200,
    text: () => vastNoAdXML
  };

  global.fetch = jest.fn(() => Promise.resolve(response));
  const vastChain = await requestAd('http://adtag.test.example.com', {});
  const lastVastResponse = vastChain[0];

  expect(lastVastResponse).toEqual({
    ad: null,
    errorCode: 300,
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
});