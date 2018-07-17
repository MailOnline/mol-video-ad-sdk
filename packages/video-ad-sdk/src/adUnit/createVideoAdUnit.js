import {
  linearEvents,
  nonLinearEvents,
  trackLinearEvent,
  trackNonLinearEvent
} from '../tracker';
import VideoAdContainer from '../adContainer/VideoAdContainer';
import {getInteractiveFiles} from '../../../../node_modules/@mol/video-ad-sdk/src/vastSelectors';
import VastAdUnit from './VastAdUnit';
import VpaidAdUnit from './VpaidAdUnit';

const validate = (vastChain, videoAdContainer) => {
  if (!Array.isArray(vastChain) || vastChain.length === 0) {
    throw new TypeError('Invalid vastChain');
  }

  if (!(videoAdContainer instanceof VideoAdContainer)) {
    throw new TypeError('Invalid VideoAdContainer');
  }
};

const hasVpaidAd = (vastChain) => {
  const ad = vastChain[0].ad;

  return Boolean(getInteractiveFiles(ad));
};

const createVideoAdUnit = (vastChain, videoAdContainer, options) => {
  validate(vastChain, videoAdContainer);
  const adUnit = hasVpaidAd(vastChain) ? new VpaidAdUnit(vastChain, videoAdContainer, options) : new VastAdUnit(vastChain, videoAdContainer, options);

  // TODO: merge onLinearEvent and onNonLinearEvent into once single handler
  const {
    onLinearEvent,
    onNonLinearEvent,
    tracker
  } = options;

  Object.values(linearEvents).forEach((linearEvent) =>
    adUnit.on(linearEvent, (event, {errorCode}, data) => {
      const payload = {
        data,
        errorCode,
        tracker
      };

      trackLinearEvent(event, vastChain, payload);

      if (typeof onLinearEvent === 'function') {
        onLinearEvent(linearEvent, vastChain, payload);
      }
    })
  );

  Object.values(nonLinearEvents).forEach((nonLinearEvent) =>
    adUnit.on(nonLinearEvent, (event, _, data) => {
      const payload = {
        data,
        tracker
      };

      trackNonLinearEvent(event, vastChain, payload);

      if (typeof onNonLinearEvent === 'function') {
        onNonLinearEvent(nonLinearEvent, vastChain, payload);
      }
    })
  );

  return adUnit;
};

export default createVideoAdUnit;

