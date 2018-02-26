/** @module vast-loader */
import requestAd from './requestAd';
import requestNextAd from './requestNextAd';

/**
 * An Object representing a processed VAST response.
 *
 * @typedef {Object} VASTResponse
 * @property {Object} ad - The selected ad extracted from the pasedXML.
 * @property {Object} parsedXML - The XML parsed object.
 * @property {number} errorCode - VAST error code number to idenitfy the error or null if there is no error.
 * @property {Error} error - Error instance with a human readable description of the error or undefined if there is no error.
 * @property {string} requestTag - Ad tag that was used to get this `VastResponse`.
 * @property {string} XML - RAW XML as it came from the server.
 */

/**
 * Array of VASTResponses sorted backguards. Last response goes first.
 * Represents the chain of VAST responses that ended up on a playable video ad or an error.
 *
 * @typedef VASTChain
 * @type Array.<VastResponse>
 */
export {

  /**
   * @function requestAd
   * @async
   * @static
   * @description Request the ad using the passed ad tag and returns an array with the VAST responses needed to get an inline ad.
   *
   * @param {string} adTag - The VAST ad tag request url.
   * @param {Object} options - Options Map. The allowed properties area:
   * * `wrapperLimit` which sets the maximum number of wrappers allowed in the vastChain.
   *    Defaults to 5.
   * * `AllowMultipleAds` Boolean to indicate whether adPods are allowed or not.
   *    Defaults to true.
   * @param {VASTChain} [vastChain] - Optional vastChain with the previous VAST responses.
   * @returns Promise<VASTChain> - Returns a Promise that will resolve a VastChain with the newest VAST response at the begining of the array.
   *                    If the VastChain had an error. The first VAST response of the array will contain an error and an errorCode entry.
   */
  requestAd,

  /**
   * @function requestNextAd
   * @async
   * @static
   * @description Requests the next ad in the VAST Chain.
   *
   * @param {VASTChain} VASTChain - Array of VAST responses. See requestAd for more info.
   * @param {Object} options - Options Map. The allowed properties area:
   * * `wrapperLimit` which sets the maximum number of wrappers allowed in the vastChain.
   *    Defaults to 5.
   * * `AllowMultipleAds` Boolean to indicate whether adPods are allowed or not.
   *    Defaults to true.
   * * `track` optional function to track whatever errors occur during the loading.
   *    Defaults to `@mol/video-ad-tracker` track method.
   * * `useAdBuffet` which should be set to true if we want to get a buffet ad from an ad pod.
   *    If no buffet ad is available it will return the next ad in ad pod sequence.
   *    Set it to true if an ad from an adPod failed and you want to replace it with an ad from the ad buffet.
   *    Defaults to false.
   * * `fallbackOnNoAd` which will tell the video player to select from any stand-alone ads available.
   *    Note: if the VASTChain contains an adPod this property will be ignored.
   *    Defaults to true.
   *
   * @returns Promise<VASTChain>  - Returns a Promise that will resolve a VastChain with the newest VAST response at the begining of the array.
   *                    If the VastChain had an error. The first VAST response of the array will contain an error and an errorCode entry.
   */
  requestNextAd
};
