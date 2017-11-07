import {VideoAdContainer} from 'mol-video-ad-container';
import {VastAdUnit} from 'mol-video-ad-unit';
import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd
} from 'mol-vast-fixtures';
import createVideoAdUnit from '../src/createVideoAdUnit';

let vastChain;
let videoAdContainer;

beforeEach(() => {
  vastChain = [
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

afterEach(() => {
  vastChain = null;
  videoAdContainer = null;
});

test('createVideoAdUnit must return a VideoAdUnit', () => {
  expect(createVideoAdUnit(vastChain, videoAdContainer)).resolves.toBeInstanceOf(VastAdUnit);
});

test('createVideoAdUnit must track the adUnit linear events');
