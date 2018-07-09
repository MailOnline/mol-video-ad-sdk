import {
  linearEvents,
  trackLinearEvent
} from '../tracker';
import VideoAdContainer from '../adContainer/VideoAdContainer';
import VastAdUnit from './VastAdUnit';

const validate = (vastChain, videoAdContainer) => {
  if (!Array.isArray(vastChain) || vastChain.length === 0) {
    throw new TypeError('Invalid vastChain');
  }

  if (!(videoAdContainer instanceof VideoAdContainer)) {
    throw new TypeError('Invalid VideoAdContainer');
  }
};

const createVastAdUnit = (vastAdChain, videoAdContainer, options) => new VastAdUnit(vastAdChain, videoAdContainer, options);

const createVideoAdUnit = (vastChain, videoAdContainer, options) => {
  validate(vastChain, videoAdContainer);
  const adUnit = createVastAdUnit(vastChain, videoAdContainer, options);
  const {
    onLinearEvent,
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

  return adUnit;
};

export default createVideoAdUnit;

