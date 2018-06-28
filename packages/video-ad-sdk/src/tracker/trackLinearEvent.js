import {
  getClickTracking,
  getCustomClick,
  getImpressionUri,
  getLinearTrackingEvents
} from '@mol/vast-selectors';
import pixelTracker from './helpers/pixelTracker';
import trackError from './helpers/trackError';
import trackIconView from './helpers/trackIconView';
import trackIconClick from './helpers/trackIconClick';
import trackProgress from './helpers/trackProgress';
import createLinearEventTracker from './helpers/createLinearEventTracker';
import {
  clickThrough,
  complete,
  firstQuartile,
  fullscreen,
  exitFullscreen,
  impression,
  iconClick,
  iconView,
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
} from './linearEvents';

/*
  * NOTE: PENDING LINEAR TRACKING EVENTS
  * acceptInvitationLinear, <= Not used in VAST maybe for VPAID
  * otherAdInteraction, <= Not used in VAST maybe for VPAID?
  * timeSpentViewing, <= Not used in VAST maybe for VPAID?
  */
const clickTrackingSelector = (ad) => {
  const trackingURIs = [];
  const clickTrackings = getClickTracking(ad);
  const customClicks = getCustomClick(ad);

  if (Array.isArray(clickTrackings) && clickTrackings.length > 0) {
    trackingURIs.push(...clickTrackings.map((uri) => ({uri})));
  }

  if (Array.isArray(customClicks) && customClicks.length > 0) {
    trackingURIs.push(...customClicks.map((uri) => ({uri})));
  }

  return trackingURIs;
};
const linearTrakingEventSelector = (event) => (ad) => getLinearTrackingEvents(ad, event);
const linearTrackers = {
  [clickThrough]: createLinearEventTracker(clickTrackingSelector),
  [complete]: createLinearEventTracker(linearTrakingEventSelector(complete)),
  [error]: trackError,
  [exitFullscreen]: createLinearEventTracker(linearTrakingEventSelector(exitFullscreen)),
  [firstQuartile]: createLinearEventTracker(linearTrakingEventSelector(firstQuartile)),
  [fullscreen]: createLinearEventTracker(linearTrakingEventSelector(fullscreen)),
  [iconClick]: trackIconClick,
  [iconView]: trackIconView,
  [impression]: createLinearEventTracker(getImpressionUri),
  [midpoint]: createLinearEventTracker(linearTrakingEventSelector(midpoint)),
  [mute]: createLinearEventTracker(linearTrakingEventSelector(mute)),
  [pause]: createLinearEventTracker(linearTrakingEventSelector(pause)),
  [playerCollapse]: createLinearEventTracker(linearTrakingEventSelector(playerCollapse)),
  [playerExpand]: createLinearEventTracker(linearTrakingEventSelector(playerExpand)),
  [progress]: trackProgress,
  [resume]: createLinearEventTracker(linearTrakingEventSelector(resume)),
  [rewind]: createLinearEventTracker(linearTrakingEventSelector(rewind)),
  [skip]: createLinearEventTracker(linearTrakingEventSelector(skip)),
  [start]: createLinearEventTracker(linearTrakingEventSelector(start)),
  [thirdQuartile]: createLinearEventTracker(linearTrakingEventSelector(thirdQuartile)),
  [unmute]: createLinearEventTracker(linearTrakingEventSelector(unmute))
};

const trackLinearEvent = (event, vastChain, {data, errorCode, tracker = pixelTracker, logger = console} = {}) => {
  const linearTracker = linearTrackers[event];

  if (linearTracker) {
    linearTracker(vastChain, {
      data: {
        ...data,
        errorCode
      },
      tracker
    });
  } else {
    logger.error(`Event '${event}' is not trackable`);
  }
};

export default trackLinearEvent;
