import {
  getAdErrorURI,
  getVastErrorURI
} from '../../vastSelectors';
import pixelTracker from './pixelTracker';

const trackError = (vastChain, {errorCode, tracker = pixelTracker} = {}) => {
  vastChain.forEach(({ad, parsedXML}) => {
    const errorURI = getAdErrorURI(ad) || getVastErrorURI(parsedXML);

    if (Boolean(errorURI)) {
      tracker(errorURI, {errorCode});
    }
  });
};

export default trackError;
