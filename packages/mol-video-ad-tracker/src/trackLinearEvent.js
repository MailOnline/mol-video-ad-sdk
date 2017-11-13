import {
  getClickThrough
} from 'mol-vast-selectors';
import pixelTracker from './helpers/pixelTracker';
import trackError from './helpers/trackError';
import createLinearEventTracker from './helpers/createLinearEventTracker';
import {
  clickThrough,
  error
} from './linearEvents';

/*
  VPAID LINEAR TRACKING EVENTS

  * acceptInvitationLinear, <= Not used in VAST maybe for VPAID
  * otherAdInteraction, <= Not used in VAST maybe for VPAID?
  * timeSpentViewing, <= Not used in VAST maybe for VPAID?

  VAST LINEAR TRACKING EVENTS

  * complete,  <= emit called with eventName and adUint
  * firstQuartile,  <= emit called with eventName and adUint
  * iconClick, <= emit called with eventName, adUnit, iconDefinition
  * iconView, <= emit called with eventName, adUnit, iconDefinition
  * impression,  <= emit called with eventName and adUint
  * midpoint,  <= emit called with eventName and adUint
  * mute, <= emit called with eventName and adUint
  * pause,  <= emit called with eventName and adUint
  * playerCollapse, <= emit called with eventName and adUint
  * playerExpand, <= emit called with eventName and adUint
  * progress, <= emit called with eventName, adUint and {accumulated: NUMBER, contentplayhead: FORMATED_STRING}
  * resume, <= emit called with eventName and adUint
  * rewind, <= emit called with eventName and adUint
  * skip, <= emit called with eventName and adUint
  * start, <= emit called with eventName and adUint
  * thirdQuartile,  <= emit called with eventName and adUint
  * unmute <= emit called with eventName and adUint

  ALREADY SUPPORTED
  * error, <= it will be called with an error object or undefined
  * clickThrough, <= emit called with eventName and adUint
  */
const linearTrackers = {
  [clickThrough]: createLinearEventTracker(getClickThrough),
  [error]: trackError
};

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
