import trackLinearEvent from '../src/trackLinearEvent';
import {
  error
} from '../src/linearEvents';
import pixelTracker from '../src/helpers/pixelTracker';
import trackError from '../src/helpers/trackError';

jest.mock('../src/helpers/trackError', () => jest.fn());

afterEach(() => {
  trackError.mockClear();
});

test('trackLinearEvent must track the error linear event with the default pixelTracker', () => {
  const vastChain = [];
  const data = {};
  const errorCode = 900;

  trackLinearEvent(error, vastChain, {
    data,
    errorCode
  });

  expect(trackError).toHaveBeenCalledTimes(1);
  expect(trackError).toHaveBeenCalledWith(vastChain, {
    data,
    errorCode,
    tracker: pixelTracker
  });
});

test('trackLinearEvent must be possible to pass a custom tracker to the linear trackers', () => {
  const vastChain = [];
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
  const vastChain = [];
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
