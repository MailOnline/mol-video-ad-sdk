import {
  linearEvents,
  trackLinearEvent
} from '../tracker';
import createVastAdUnit from './createVastAdUnit';

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

      trackLinearEvent(event, vastChain, payload);

      if (typeof onLinearEvent === 'function') {
        onLinearEvent(linearEvent, vastChain, payload);
      }
    })
  );

  return adUnit;
};

export default createVideoAdUnit;

