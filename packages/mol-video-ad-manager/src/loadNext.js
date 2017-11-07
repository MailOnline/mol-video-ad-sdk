/* eslint-disable no-unused-vars */
/**
 * Loads the next ad in the VAST Chain.
 *
 * @param {Array} VASTChain - Array of VAST responses. See `load` or `requestAd` for more info.
 * @param {Object} options - Options Map. The allowed properties area:
 *                           * `wrapperLimit` which sets the maximum number of wrappers allowed in the vastChain.
 *                              Defaults to 5.
 *                           * `AllowMultipleAds` Boolean to indicate whether adPods are allowed or not.
 *                              Defaults to true.
 *                           * `track` optional function to track whatever errors occur during the loading.
 *                              Defaults to `mol-video-ad-tracker` track method.
 *                           * `useAdBuffet` which should be set to true if we want to get a buffet ad from an ad pod.
 *                              If no buffet ad is available it will return the next ad in ad pod sequence.
 *                              Set it to true if an ad from an adPod failed and you want to replace it with an ad from the ad buffet.
 *                              Defaults to false.
 *                           * `fallbackOnNoAd` which will tell the video player to select from any stand-alone ads available.
 *                              Note: if the VASTChain contains an adPod this property will be ignored.
 *                              Defaults to true.
 *
 * @returns {Array} - Returns a Promise that will resolve a VastChain with the newest VAST response at the begining of the array.
 *                    If the VastChain had an error. The first VAST response of the array will contain an error and an errorCode entry.
 * @static
 */
const loadNext = (VASTChain, options = {}) => {

};

export default loadNext;
