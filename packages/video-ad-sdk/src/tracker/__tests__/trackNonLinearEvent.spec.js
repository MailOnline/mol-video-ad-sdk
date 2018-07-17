import {getFirstAd} from '../../vastSelectors';
import {
  wrapperParsedXML,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML,
  vastPodXML
} from '../../../fixtures';
import trackNonLinearEvent from '../trackNonLinearEvent';
import {
  acceptInvitation,
  adCollapse,
  close,
  creativeView
} from '../nonLinearEvents';
import pixelTracker from '../helpers/pixelTracker';

jest.mock('../helpers/pixelTracker', () => jest.fn());

describe('trackNonLinearEvent', () => {
  const vastChain = [
    {
      ad: vpaidInlineAd,
      error: null,
      errorCode: null,
      parsedXML: vpaidInlineParsedXML,
      requestTag: 'https://test.example.com/vastadtaguri',
      XML: vastVpaidInlineXML
    },
    {
      ad: getFirstAd(wrapperParsedXML),
      errorCode: null,
      parsedXML: wrapperParsedXML,
      requestTag: 'http://adtag.test.example.com',
      XML: vastPodXML
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('must log an error if it gets an unknown event', () => {
    const logger = {
      error: jest.fn()
    };

    trackNonLinearEvent('UNKNOWN', vastChain, {
      data: {},
      logger
    });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Event \'UNKNOWN\' can not be tracked');
  });

  test('must use pixelTracker by default', () => {
    const data = {};

    trackNonLinearEvent(acceptInvitation, vastChain, {
      data
    });

    expect(pixelTracker).toHaveBeenCalledTimes(1);
    expect(pixelTracker).toHaveBeenCalledWith('https://test.example.com/vpaid/acceptInvitation', data);
  });

  [
    acceptInvitation,
    adCollapse,
    close,
    creativeView
  ].forEach((event) => {
    test(`must track ${event} linear event with the default pixelTracker`, () => {
      const data = {};
      const tracker = jest.fn();

      trackNonLinearEvent(event, vastChain, {
        data,
        tracker
      });

      expect(tracker).toHaveBeenCalledWith(`https://test.example.com/vpaid/${event}`, {});
    });
  });
});
