import {VideoAdContainer} from 'mol-video-ad-container';
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import createVastAdUnit from '../src/createVastAdUnit';
import VastAdUnit from '../src/VastAdUnit';

let vastAdChain;
let videoAdContainer;

beforeEach(() => {
  vastAdChain = [
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
  ];
  videoAdContainer = new VideoAdContainer(document.createElement('DIV'));
});

test('createVastAdUnit must complain if you don\'t pass a vastAdChain or a videoAdContainer', () => {
  expect(createVastAdUnit).toThrowError(TypeError);
  expect(() => createVastAdUnit([])).toThrowError(TypeError);
  expect(() => createVastAdUnit(vastAdChain)).toThrowError(TypeError);
  expect(() => createVastAdUnit(vastAdChain, {})).toThrowError(TypeError);
});

test('createVastAdUnit must resolve with a VastAdUnit', async () => {
  expect(await createVastAdUnit(vastAdChain, videoAdContainer)).toBeInstanceOf(VastAdUnit);
});
