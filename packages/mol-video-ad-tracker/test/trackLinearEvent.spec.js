import trackLinearEvent from '../src/trackLinearEvent';
import pixelTracker from '../src/helpers/pixelTracker';
import linearTrackers from '../src/helpers/linearTrackers';

jest.mock('../src/helpers/linearTrackers', () => ({
  test: jest.fn()
}));

afterEach(() => {
  linearTrackers.test.mockClear();
});

test('trackLinearEvent must track the any linear event with the default pixelTracker', () => {
  const vastChain = [];
  const data = {};
  const errorCode = 900;

  trackLinearEvent('test', vastChain, {
    data,
    errorCode
  });

  expect(linearTrackers.test).toHaveBeenCalledTimes(1);
  expect(linearTrackers.test).toHaveBeenCalledWith(vastChain, {
    data,
    errorCode,
    tracker: pixelTracker
  });
});

test('trackLinearEvent must be possible to pass a custom tracker to the linear trackers', () => {
  const vastChain = [];
  const data = {};
  const customTracker = () => {};

  trackLinearEvent('test', vastChain, {
    data,
    tracker: customTracker
  });

  expect(linearTrackers.test).toHaveBeenCalledTimes(1);
  expect(linearTrackers.test).toHaveBeenCalledWith(vastChain, {
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

  expect(linearTrackers.test).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledWith('Event \'wrongEvent\' is not trackable');
});
