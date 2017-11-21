/* eslint-disable promise/prefer-await-to-callbacks */
import {
  getClickThrough,
  getSkipoffset
} from 'mol-vast-selectors';
import getProgressEvents from '../progress/getProgressEvents';
import metricHandlers from './handlers';

const setupMetricHandlers = ({vastChain, videoAdContainer, hooks}, callback) => {
  const inlineAd = vastChain[0].ad;
  const skipoffset = getSkipoffset(inlineAd);
  const clickThroughUrl = getClickThrough(inlineAd);
  const progressEvents = getProgressEvents(vastChain);
  const data = {
    clickThroughUrl,
    progressEvents,
    skipoffset,
    ...hooks
  };

  const stopHandlersFns = metricHandlers.map((handler) => handler(videoAdContainer, callback, data));

  return () => stopHandlersFns.forEach((disconnect) => disconnect());
};

export default setupMetricHandlers;
