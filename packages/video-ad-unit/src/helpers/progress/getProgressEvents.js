import {linearEvents} from '@mol/video-ad-tracker';
import {getLinearTrackingEvents} from '@mol/vast-selectors';

const {
  progress
} = linearEvents;

const getProgressEvents = (vastChain) => vastChain.map(({ad}) => ad)
  .reduce((accumulated, ad) => {
    const events = getLinearTrackingEvents(ad, progress) || [];

    return [
      ...accumulated,
      ...events
    ];
  }, [])
  .map(({offset, uri}) => ({
    offset,
    uri
  }));

export default getProgressEvents;
