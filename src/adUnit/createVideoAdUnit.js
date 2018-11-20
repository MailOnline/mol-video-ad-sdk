import {
  linearEvents,
  nonLinearEvents,
  trackLinearEvent,
  trackNonLinearEvent
} from '../tracker';
import VastAdUnit from './VastAdUnit';
import VpaidAdUnit from './VpaidAdUnit';

const createVideoAdUnit = (vastChain, videoAdContainer, options) => {
  const {
    tracker,
    type
  } = options;
  const adUnit = type === 'VPAID' ? new VpaidAdUnit(vastChain, videoAdContainer, options) : new VastAdUnit(vastChain, videoAdContainer, options);

  Object.values(linearEvents).forEach((linearEvent) =>
    adUnit.on(linearEvent, (event, {errorCode}, data) => {
      const payload = {
        data,
        errorCode,
        tracker
      };

      trackLinearEvent(event, vastChain, payload);
    })
  );

  Object.values(nonLinearEvents).forEach((nonLinearEvent) =>
    adUnit.on(nonLinearEvent, (event, _, data) => {
      const payload = {
        data,
        tracker
      };

      trackNonLinearEvent(event, vastChain, payload);
    })
  );

  return adUnit;
};

export default createVideoAdUnit;

