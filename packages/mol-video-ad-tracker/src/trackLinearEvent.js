import pixelTracker from './helpers/pixelTracker';
import linearTrackers from './helpers/linearTrackers';

const trackLinearEvent = (event, vastChain, {data, errorCode, tracker = pixelTracker, logger = console} = {}) => {
  const linearTracker = linearTrackers[event];

  if (linearTracker) {
    linearTracker(vastChain, {
      data,
      errorCode,
      tracker
    });
  } else {
    logger.error(`Event '${event}' is not trackable`);
  }
};

export default trackLinearEvent;
