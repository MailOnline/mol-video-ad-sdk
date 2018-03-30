import {requestAd} from '@mol/vast-loader';
import {trackError} from '../tracker';

/**
 * Request the ad using the passed ad tag and returns an array with the VAST responses needed to get an inline ad.
 *
 * @param {string} adTag - The VAST ad tag request url.
 * @param {Object} options - Options Map. The allowed properties area:
 *                           * `wrapperLimit` which sets the maximum number of wrappers allowed in the vastChain.
 *                              Defaults to 5.
 *                           * `AllowMultipleAds` Boolean to indicate whether adPods are allowed or not.
 *                              Defaults to true.
 *                           * `tracker` optional function to track whatever errors occur during the loading.
 *                              Defaults to `@mol/video-ad-tracker` macrosTracker method.
 * @returns Promise<VASTChain> - Returns a Promise that will resolve a VastChain with the newest VAST response at the begining of the array.
 *                              If the VastChain had an error. The first VAST response of the array will contain an error and an errorCode entry.
 * @static
 */
const load = async (adTag, options = {}) => {
  if (typeof adTag !== 'string' || adTag.length === 0) {
    throw new TypeError('Invalid ad tag');
  }

  const vastChain = await requestAd(adTag, options);
  const lastVastResponse = vastChain[0];

  if (lastVastResponse && Boolean(lastVastResponse.errorCode)) {
    const {tracker} = options;

    trackError(vastChain, {
      errorCode: lastVastResponse.errorCode,
      tracker
    });
  }

  return vastChain;
};

export default load;
