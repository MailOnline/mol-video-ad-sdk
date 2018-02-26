import {
  getVASTAdTagURI,
  isWrapper
} from '@mol/vast-selectors';
import requestAd from './requestAd';
import getNextAd from './helpers/getNextAd';
import {markAdAsRequested} from './helpers/adUtils';

const validateChain = (VASTChain) => {
  if (!Array.isArray(VASTChain)) {
    throw new TypeError('Invalid VAST chain');
  }

  if (VASTChain.length === 0) {
    throw new Error('No next ad to request');
  }
};

const requestNextAd = (VASTChain, options) => {
  validateChain(VASTChain);

  const vastResponse = VASTChain[0];
  const nextAd = getNextAd(vastResponse, options);

  if (Boolean(nextAd)) {
    const newVastResponse = Object.assign({}, vastResponse, {
      ad: nextAd
    });
    const newVastChain = [newVastResponse, ...VASTChain.slice(1)];

    markAdAsRequested(nextAd);

    if (isWrapper(nextAd)) {
      return requestAd(getVASTAdTagURI(nextAd), options, newVastChain);
    }

    return Promise.resolve(newVastChain);
  }

  return requestNextAd(VASTChain.slice(1), options);
};

export default requestNextAd;
