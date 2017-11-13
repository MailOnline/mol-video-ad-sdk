import {
  getAdErrorURI,
  getVastErrorURI
} from 'mol-vast-selectors';
import pixelTracker from './pixelTracker';

const trackError = (vastChain, {errorCode, tracker = pixelTracker} = {}) => {
  const ERRORCODE = errorCode;
  const errorURIs = [];

  vastChain.forEach(({ad, parsedXML}) => {
    const errorURI = getAdErrorURI(ad) || getVastErrorURI(parsedXML);

    if (Boolean(errorURI)) {
      errorURIs.push(errorURI);
    }
  });

  errorURIs.forEach((macro) => tracker(macro, {ERRORCODE}));
};

export default trackError;
