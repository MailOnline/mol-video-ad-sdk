import xml2js from 'mol-vast-xml2js';
import {
  getFirstAd,
  getVASTAdTagURI,
  isWrapper
} from 'mol-vast-selectors';
import fetch from './helpers/fetch';

const DEFAULT_OPTIONS = {
  allowMultipleAds: true,
  wrapperLimit: 5
};

/**
 * Request the ad using the passed ad tag and returns an array with the VAST responses needed to get an inline ad.
 *
 * @param {string} adTag - The VAST ad tag request url.
 * @param {Object} options - Config object to set the wrapperlimit.
 * @param {Array} vastChain - Optional array with the previous VAST responses.
 * @returns {Array} - Returns a new VastChain with the newest VAST response at the begining of the array.
 * @static
 */
const requestAd = async (adTag, options = {}, vastChain = []) => {
  let VASTAdResponse = {
    ad: null,
    errorCode: null,
    parsedXML: null,
    requestTag: adTag,
    XML: null
  };

  let response;
  let XML;
  let parsedXML;
  let ad;

  try {
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);
    const wrapperLimit = opts.wrapperLimit;

    if (vastChain.length >= wrapperLimit) {
      VASTAdResponse.errorCode = 304;

      return [VASTAdResponse, ...vastChain];
    }
    response = await fetch(adTag, options);
    XML = await response.text();
    parsedXML = xml2js(XML, {compact: false});
    ad = getFirstAd(parsedXML);

    if (ad) {
      // eslint-disable-next-line id-match
      ad.___requested = true;
    }

    VASTAdResponse = {
      ad,
      errorCode: Boolean(ad) ? null : 300,
      parsedXML,
      requestTag: adTag,
      XML
    };

    const newVastChain = [VASTAdResponse, ...vastChain];

    if (isWrapper(ad)) {
      return requestAd(getVASTAdTagURI(ad), options, newVastChain);
    }

    return newVastChain;
  } catch (error) {
    let errorCode = 900;

    if (!response || !XML) {
      errorCode = 502;
    } else if (!parsedXML) {
      errorCode = 100;
    }

    VASTAdResponse.errorCode = errorCode;
    VASTAdResponse.error = error;

    return [VASTAdResponse, ...vastChain];
  }
};

export default requestAd;
