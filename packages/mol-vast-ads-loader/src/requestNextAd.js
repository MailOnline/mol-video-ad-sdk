import {
  getVASTAdTagURI,
  isWrapper
} from 'mol-vast-selectors';
import requestAd from './requestAd';
import getNextAd from './helpers/getNextAd';
import markAsRequested from './helpers/markAsRequested';

const validateChain = (VASTChain) => {
  if (!Array.isArray(VASTChain)) {
    throw new TypeError('Invalid VAST chain');
  }

  if (VASTChain.length === 0) {
    throw new Error('No next ad to request');
  }
};

/**
 *
 * @param {Array} VASTChain - Array of VAST responses. See requestAd for more info.
 * @param {Object} options - Options Map. The allowed properties area:
 *                            - `useAdBuffet` which should be set to true if we want to get a buffet ad from an ad pod.
 *                                            If no buffet ad is available it will return the next ad in ad pod sequence.
 *                                            Defaults to true.
 *                            - `fallbackOnNoAd` which will tell the video player to select from any stand-alone ads available.
 *                                               Defaults to true.
 */
const requestNextAd = (VASTChain, options) => {
  validateChain(VASTChain);

  const vastResponse = VASTChain[0];
  const nextAd = markAsRequested(getNextAd(vastResponse, options));

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
