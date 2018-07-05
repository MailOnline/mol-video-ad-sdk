import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from '../../../fixtures';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import createVastAdUnit from '../createVastAdUnit';
import VastAdUnit from '../VastAdUnit';

let vastAdChain;
let videoAdContainer;

beforeEach(() => {
  vastAdChain = [
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
