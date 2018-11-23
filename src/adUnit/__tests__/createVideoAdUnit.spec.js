import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../fixtures';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import {
  linearEvents,
  trackLinearEvent,
  trackNonLinearEvent,
  nonLinearEvents
} from '../../tracker';
import VastAdUnit from '../VastAdUnit';
import createVideoAdUnit from '../createVideoAdUnit';
import VpaidAdUnit from '../VpaidAdUnit';

jest.mock('../../tracker', () => ({
  ...require.requireActual('../../tracker'),
  trackLinearEvent: jest.fn(),
  trackNonLinearEvent: jest.fn()
}));

describe('createVideoAdUnit', () => {
  let vastChain;
  let vpaidChain;
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
    vpaidChain = [
      {
        ad: vpaidInlineAd,
        errorCode: null,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastVpaidInlineXML
      }
    ];

    videoAdContainer = new VideoAdContainer(document.createElement('DIV'));
  });

  afterEach(() => {
    vastChain = null;
    videoAdContainer = null;
    trackLinearEvent.mockClear();
    trackNonLinearEvent.mockClear();
  });

  test('must return a VastAdUnit for Vast ads', () => {
    const adUnit = createVideoAdUnit(vastChain, videoAdContainer, {
      type: 'VAST'
    });

    expect(adUnit).toBeInstanceOf(VastAdUnit);
  });

  test('must return a VpaidAdUnit for Vpaid ads', () => {
    const adUnit = createVideoAdUnit(vpaidChain, videoAdContainer, {
      type: 'VPAID'
    });

    expect(adUnit).toBeInstanceOf(VpaidAdUnit);
  });

  Object.values(linearEvents).forEach((event) => {
    test(`must track the ${event} linear events`, async () => {
      const adUnit = createVideoAdUnit(vastChain, videoAdContainer, {});
      const data = {
        progressUri: 'http://test.example.com/progress'
      };
      const eventPromise = new Promise((resolve) => adUnit.on(event, resolve));

      adUnit.errorCode = 999;
      adUnit.emit(event, {
        adUnit,
        data,
        type: event
      });

      await eventPromise;

      expect(trackLinearEvent).toHaveBeenCalledTimes(1);
      expect(trackLinearEvent).toHaveBeenCalledWith(event, vastChain, {
        data,
        errorCode: adUnit.errorCode
      });
    });
  });

  Object.values(nonLinearEvents).forEach((event) => {
    test(`must track the ${event} non linear event`, async () => {
      const adUnit = createVideoAdUnit(vastChain, videoAdContainer, {});
      const data = {
        progressUri: 'http://test.example.com/progress'
      };
      const eventPromise = new Promise((resolve) => adUnit.on(event, resolve));

      adUnit.emit(event, {
        adUnit,
        data,
        type: event
      });

      await eventPromise;

      expect(trackNonLinearEvent).toHaveBeenCalledTimes(1);
      expect(trackNonLinearEvent).toHaveBeenCalledWith(event, vastChain, {
        data
      });
    });
  });
});
