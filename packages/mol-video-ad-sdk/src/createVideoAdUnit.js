import {createVastAdUnit} from 'mol-video-ad-unit';
import {
  linearEvents,
  trackLinearEvent
} from 'mol-video-ad-tracker';

const createVideoAdUnit = async (vastChain, videoAdContainer, options = {}) => {
  const adUnit = await createVastAdUnit(vastChain, videoAdContainer, options);
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

      trackLinearEvent(event, payload);

      if (typeof onLinearEvent === 'function') {
        onLinearEvent(linearEvent, payload);
      }
    })
  );

  return adUnit;
};

export default createVideoAdUnit;

