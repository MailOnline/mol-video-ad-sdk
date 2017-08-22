import {
  getVASTAdTagURI,
  isWrapper
} from 'mol-vast-selectors';
import requestAd from './requestAd';
import getNextAd from './helpers/getNextAd';

/**
 *
 * @param {Array} VASTChain - Array of VAST responses. See requestAd for more info.
 * @param {Object} options - The only possible options is `useAdBuffet` which should be set to true if we want to get a buffet ad from an ad pod.
 *                           If no buffet ad is available it will return the next ad in ad pod sequence.
 */
const requestNextAd = (VASTChain, options) => {
  if (!Array.isArray(VASTChain)) {
    throw new TypeError('Invalid VAST chain');
  }

  if (VASTChain.length === 0) {
    throw new Error('No next ad to request');
  }

  const vastResponse = VASTChain[0];
  const nextAd = getNextAd(vastResponse, options);

  if (Boolean(nextAd)) {
    const newVastResponse = Object.assign({}, vastResponse, {
      ad: nextAd
    });
    const newVastChain = [newVastResponse, ...VASTChain.slice(1)];

    if (isWrapper(nextAd)) {
      return requestAd(getVASTAdTagURI(nextAd), options, newVastChain);
    }

    return Promise.resolve(newVastChain);
  }

  return requestNextAd(VASTChain.slice(1), options);
};

export default requestNextAd;
