import {
  getVASTAdTagURI,
  isWrapper
} from '../vastSelectors';
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

/**
 * @function requestNextAd
 * @static
 * @description Requests the next ad in the VAST Chain.
 *
 * @param {VASTChain} VASTChain - Array of VAST responses. See requestAd for more info.
 * @param {Object} options - Options Map. The allowed properties are:
 * @param {number} [options.wrapperLimit] - Sets the maximum number of wrappers allowed in the vastChain.
 *  Defaults to `5`.
 * @param {boolean} [options.AllowMultipleAds] - Boolean to indicate whether adPods are allowed or not.
 *  Defaults to `true`.
 * @param {tracker} [options.track] - optional function to track whatever errors occur during the loading.
 *  Defaults to `@mol/video-ad-tracker` track method.
 * @param {boolean} [options.useAdBuffet] - Specifies whether to use buffet ads from an ad pod if possible.
 *    If no buffet ad is available it will return the next ad in ad pod sequence.
 *    Set it to true if an ad from an adPod failed and you want to replace it with an ad from the ad buffet.
 *    Defaults to `false`.
 * @param {boolean} [options.fallbackOnNoAd] - tells the video player to select an ad from any stand-alone ads available.
 *    Note: if the {@link VASTChain} contains an adPod this property will be ignored.
 *    Defaults to `true`.
 * @param {number} [options.timeout] - timeout number in milliseconds. If Present, the request will timeout if it is not fulfilled before the specified time.
 *
 * @returns Promise<VASTChain>  - Returns a Promise that will resolve a VastChain with the newest VAST response at the beginning of the array.
 * If the VastChain had an error. The first VAST response of the array will contain an error and an errorCode entry.
 */
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
