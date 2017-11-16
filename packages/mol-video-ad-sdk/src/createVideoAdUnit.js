import {createVastAdUnit} from 'mol-video-ad-unit';
import {
  linearEvents,
  trackLinearEvent
} from 'mol-video-ad-tracker';

const createVideoAdUnit = async (vastChain, videoAdContainer, options = {}) => {
  const adUnit = await createVastAdUnit(vastChain, videoAdContainer, options);
  const {tracker} = options;

  Object.values(linearEvents).forEach((linearEvent) =>
    adUnit.on(linearEvent, (event, {errorCode}, data) => trackLinearEvent(event, {
      data,
      errorCode,
      tracker
    }))
  );

  return adUnit;
};

export default createVideoAdUnit;

