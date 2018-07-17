import {getNonLinearTrackingEvents} from '../vastSelectors';
import createVastEventTracker from './helpers/createVastEventTracker';
import pixelTracker from './helpers/pixelTracker';
import {
  acceptInvitation,
  adCollapse,
  close,
  creativeView
} from './nonLinearEvents';

const trakingEventSelector = (event) => (ad) => getNonLinearTrackingEvents(ad, event);
const linearTrackers = {
  [acceptInvitation]: createVastEventTracker(trakingEventSelector(acceptInvitation)),
  [adCollapse]: createVastEventTracker(trakingEventSelector(adCollapse)),
  [close]: createVastEventTracker(trakingEventSelector(close)),
  [creativeView]: createVastEventTracker(trakingEventSelector(creativeView))

};

const trackNonLinearEvent = (event, vastChain, {data, tracker = pixelTracker, logger = console}) => {
  const linearTracker = linearTrackers[event];

  if (linearTracker) {
    linearTracker(vastChain, {
      data: {
        ...data
      },
      tracker
    });
  } else {
    logger.error(`Event '${event}' cannot be tracked`);
  }
};

export default trackNonLinearEvent;
