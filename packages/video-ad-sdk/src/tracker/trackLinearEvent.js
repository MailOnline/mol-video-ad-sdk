import {
  getClickTracking,
  getCustomClick,
  getImpressionUri,
  getLinearTrackingEvents
} from '../vastSelectors';
import pixelTracker from './helpers/pixelTracker';
import trackError from './helpers/trackError';
import trackIconView from './helpers/trackIconView';
import trackIconClick from './helpers/trackIconClick';
import trackProgress from './helpers/trackProgress';
import createVastEventTracker from './helpers/createVastEventTracker';
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

// TODO: IMPLEMENT VPAID CLICK LOGIC
const clickTrackingSelector = (ad) => {
  const trackingURIs = [];
  const clickTrackings = getClickTracking(ad);
  const customClicks = getCustomClick(ad);

  /* istanbul ignore else */
  if (Array.isArray(clickTrackings) && clickTrackings.length > 0) {
    trackingURIs.push(...clickTrackings.map((uri) => ({uri})));
  }

  /* istanbul ignore else */
  if (Array.isArray(customClicks) && customClicks.length > 0) {
    trackingURIs.push(...customClicks.map((uri) => ({uri})));
  }

  return trackingURIs;
};

const linearTrakingEventSelector = (event) => (ad) => getLinearTrackingEvents(ad, event);
const linearTrackers = {
  [clickThrough]: createVastEventTracker(clickTrackingSelector),
  [complete]: createVastEventTracker(linearTrakingEventSelector(complete)),
  [error]: trackError,
  [exitFullscreen]: createVastEventTracker(linearTrakingEventSelector(exitFullscreen)),
  [firstQuartile]: createVastEventTracker(linearTrakingEventSelector(firstQuartile)),
  [fullscreen]: createVastEventTracker(linearTrakingEventSelector(fullscreen)),
  [iconClick]: trackIconClick,
  [iconView]: trackIconView,
  [impression]: createVastEventTracker(getImpressionUri),
  [midpoint]: createVastEventTracker(linearTrakingEventSelector(midpoint)),
  [mute]: createVastEventTracker(linearTrakingEventSelector(mute)),
  [pause]: createVastEventTracker(linearTrakingEventSelector(pause)),
  [playerCollapse]: createVastEventTracker(linearTrakingEventSelector(playerCollapse)),
  [playerExpand]: createVastEventTracker(linearTrakingEventSelector(playerExpand)),
  [progress]: trackProgress,
  [resume]: createVastEventTracker(linearTrakingEventSelector(resume)),
  [rewind]: createVastEventTracker(linearTrakingEventSelector(rewind)),
  [skip]: createVastEventTracker(linearTrakingEventSelector(skip)),
  [start]: createVastEventTracker(linearTrakingEventSelector(start)),
  [thirdQuartile]: createVastEventTracker(linearTrakingEventSelector(thirdQuartile)),
  [unmute]: createVastEventTracker(linearTrakingEventSelector(unmute))
};

const trackLinearEvent = (event, vastChain, {data, errorCode, tracker = pixelTracker, logger = console}) => {
  const linearTracker = linearTrackers[event];

  if (linearTracker) {
    linearTracker(vastChain, {
      data: {
        ...data,
        errorCode
      },
      errorCode,
      tracker
    });
  } else {
    logger.error(`Event '${event}' can not be tracked`);
  }
};

export default trackLinearEvent;
