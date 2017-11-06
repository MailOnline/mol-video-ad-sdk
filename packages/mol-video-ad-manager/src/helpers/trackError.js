import {track} from 'mol-video-ad-tracker';
import {
  getAdErrorURI,
  getVastErrorURI
} from 'mol-vast-selectors';

// TODO: TEST THIS LOGIC
const trackError = (vastChain, doTrack = track) => {
  const ERRORCODE = vastChain[0].errorCode;
  const errorURIs = [];

  vastChain.forEach(({ad, parsedXML}) => {
    const errorURI = getAdErrorURI(ad) || getVastErrorURI(parsedXML);

    if (Boolean(errorURI)) {
      errorURIs.push(errorURI);
    }
  });

  errorURIs.forEach((macro) => doTrack(macro, {ERRORCODE}));
};

export default trackError;
