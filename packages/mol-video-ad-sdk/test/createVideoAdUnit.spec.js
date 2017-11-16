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
import {
  linearEvents,
  trackLinearEvent
} from 'mol-video-ad-tracker';
import createVideoAdUnit from '../src/createVideoAdUnit';

jest.mock('mol-video-ad-tracker', () => ({
  ...require.requireActual('mol-video-ad-tracker'),
  trackLinearEvent: jest.fn()
}));

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

test('createVideoAdUnit must return a VideoAdUnit', async () => {
  const adUnit = await createVideoAdUnit(vastChain, videoAdContainer);

  expect(adUnit).toBeInstanceOf(VastAdUnit);
});

Object.values(linearEvents).forEach((event) => {
  test(`createVideoAdUnit must track the ${event} linear events`, async () => {
    const adUnit = await createVideoAdUnit(vastChain, videoAdContainer);
    const data = {
      progressUri: 'http://test.example.com/progress'
    };
    const eventPromise = new Promise((resolve) => adUnit.on(event, resolve));

    adUnit.errorCode = 999;
    adUnit.emit(event, event, adUnit, data);

    await eventPromise;

    expect(trackLinearEvent).toHaveBeenCalledTimes(1);
    expect(trackLinearEvent).toHaveBeenCalledWith(event, {
      data,
      errorCode: adUnit.errorCode
    });

    trackLinearEvent.mockClear();
  });
});
