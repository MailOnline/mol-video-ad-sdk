import {
  wrapperParsedXML,
  inlineAd,
  inlineParsedXML,
  vastInlineXML,
  vastPodXML
} from '@mol/vast-fixtures';
import {getFirstAd} from '@mol/vast-selectors';
import trackLinearEvent from '../trackLinearEvent';
import {
  clickThrough,
  complete,
  firstQuartile,
  impression,
  iconClick,
  iconView,
  fullscreen,
  midpoint,
  mute,
  pause,
  playerCollapse,
  playerExpand,
  progress,
  resume,
  rewind,
  skip,
  start,
  thirdQuartile,
  unmute,
  error
} from '../linearEvents';
import pixelTracker from '../helpers/pixelTracker';
import trackError from '../helpers/trackError';

jest.mock('../helpers/trackError', () => jest.fn());

const vastChain = [
  {
    ad: inlineAd,
    error: null,
    errorCode: null,
    parsedXML: inlineParsedXML,
    requestTag: 'https://test.example.com/vastadtaguri',
    XML: vastInlineXML
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

test('trackLinearEvent must track the error linear event with the default pixelTracker', () => {
  const data = {};
  const errorCode = 900;

  trackLinearEvent(error, vastChain, {
    data,
    errorCode
  });

  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(vastChain, {
    data: {errorCode},
    tracker: pixelTracker
  });
});

test('trackLinearEvent must be possible to pass a custom tracker to the linear trackers', () => {
  const data = {};
  const customTracker = () => {};

  trackLinearEvent(error, vastChain, {
    data,
    tracker: customTracker
  });

  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(vastChain, {
    data,
    errorCode: undefined,
    tracker: customTracker
  });
});

test('trackLinearEvent must log an error if the the event can\'t be tracked', () => {
  const data = {};
  const logger = {
    error: jest.fn()
  };

  trackLinearEvent('wrongEvent', vastChain, {
    data,
    logger
  });

  expect(logger.error).toHaveBeenCalledWith('Event \'wrongEvent\' is not trackable');
});

test(`trackLinearEvent must track ${clickThrough} linear event with the default pixelTracker`, () => {
  const data = {};
  const tracker = jest.fn();

  trackLinearEvent(clickThrough, vastChain, {
    data,
    tracker
  });

  expect(tracker).toHaveBeenCalledTimes(3);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/clickthrough', {});
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/clicktracking', {});
});

[
  start,
  complete,
  firstQuartile,
  midpoint,
  playerCollapse,
  playerExpand,
  thirdQuartile,
  mute,
  unmute,
  rewind,
  pause,
  resume,
  fullscreen,
  skip
].forEach((event) => {
  test(`trackLinearEvent must track ${event} linear event with the default pixelTracker`, () => {
    const data = {};
    const tracker = jest.fn();

    trackLinearEvent(event, vastChain, {
      data,
      tracker
    });

    expect(tracker).toHaveBeenCalledWith(`https://test.example.com/${event}`, {});
    expect(tracker).toHaveBeenCalledWith(`https://test.example.com/${event}2`, {});
  });
});

test('trackLinearEvent must track impression linear event with the default pixelTracker', () => {
  const data = {};
  const tracker = jest.fn();

  trackLinearEvent(impression, vastChain, {
    data,
    tracker
  });

  expect(tracker).toHaveBeenCalledTimes(2);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/impression', {});
});

test('trackLinearEvent must track iconClicks', () => {
  const data = {
    iconClickTracking: [
      'https://test.example.com/iconClick',
      'https://test.example.com/iconClick2'
    ]
  };
  const tracker = jest.fn();

  trackLinearEvent(iconClick, vastChain, {
    data,
    tracker
  });

  expect(tracker).toHaveBeenCalledTimes(2);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/iconClick', data);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/iconClick2', data);
});

test('trackLinearEvent must track iconViews', () => {
  const data = {
    iconViewTracking: [
      'https://test.example.com/iconView',
      'https://test.example.com/iconView2'
    ]
  };
  const tracker = jest.fn();

  trackLinearEvent(iconView, vastChain, {
    data,
    tracker
  });

  expect(tracker).toHaveBeenCalledTimes(2);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/iconView', data);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/iconView2', data);
});

test('trackLinearEvent must track progress', () => {
  const data = {
    progressUri: 'https://test.example.com/progress'
  };
  const tracker = jest.fn();

  trackLinearEvent(progress, vastChain, {
    data,
    tracker
  });

  expect(tracker).toHaveBeenCalledTimes(1);
  expect(tracker).toHaveBeenCalledWith('https://test.example.com/progress', data);
});
