import {hasAdPod} from '@mol/vast-selectors';

// TODO: MOVE this method to the vast-selectors module
/**
 * Returns true if the passed VASTChain has an ad pod or false otherwise.
 *
 * @param {Array} VASTChain - Array of VAST responses. See `load` or `requestAd` for more info.
 *
 * @returns {boolean} - True if the VASTChain contains an ad pod and false otherwise.
 * @static
 */
const isAdPod = (VASTChain = []) => VASTChain.map(({parsedXML}) => parsedXML).some(hasAdPod);

export default isAdPod;
