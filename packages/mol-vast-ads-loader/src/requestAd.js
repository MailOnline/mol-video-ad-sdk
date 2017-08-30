import xml2js from 'mol-vast-xml2js';
import {
  getWrapperOptions,
  getFirstAd,
  getVASTAdTagURI,
  hasAdPod,
  isInline,
  isWrapper
} from 'mol-vast-selectors';
import fetch from './helpers/fetch';
import markAsRequested from './helpers/markAsRequested';

const validateChain = (vastChain, {wrapperLimit = 5}) => {
  if (vastChain.length >= wrapperLimit) {
    const error = new Error('Wrapper Limit reached');

    error.errorCode = 304;
    throw error;
  }
};

const fetchAdXML = async (adTag, options) => {
  try {
    const response = await fetch(adTag, options);
    const XML = await response.text();

    return XML;
  } catch (error) {
    error.errorCode = 502;

    throw error;
  }
};

const parseVASTXML = (xml) => {
  try {
    return xml2js(xml);
  } catch (error) {
    error.errorCode = 100;
    throw error;
  }
};

const getAd = (parsedXML) => {
  try {
    const ad = getFirstAd(parsedXML);

    if (Boolean(ad)) {
      return markAsRequested(ad);
    }

    throw new Error('No Ad');
  } catch (error) {
    error.errorCode = 303;
    throw error;
  }
};

const validateResponse = ({ad, parsedXML}, {allowMultipleAds = true, followAdditionalWrappers = true}) => {
  if (!isWrapper(ad) && !isInline(ad)) {
    const error = new Error('Invalid VAST, ad contains neither Wrapper nor Inline');

    error.errorCode = 101;
    throw error;
  }

  if (hasAdPod(parsedXML) && !allowMultipleAds) {
    const error = new Error('Multiple ads are not allowed');

    error.errorCode = 203;
    throw error;
  }

  if (isWrapper(ad) && !followAdditionalWrappers) {
    const error = new Error('To follow additional wrappers is not allowed');

    error.errorCode = 200;
    throw error;
  }
};

const getOptions = (vastChain, options) => {
  const parentAd = vastChain[0];
  const parentAdIsWrapper = Boolean(parentAd) && isWrapper(parentAd.ad);
  const wrapperOptions = parentAdIsWrapper ? getWrapperOptions(parentAd.ad) : {};

  return Object.assign({}, wrapperOptions, options);
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
  const VASTAdResponse = {
    ad: null,
    errorCode: null,
    parsedXML: null,
    requestTag: adTag,
    XML: null
  };

  try {
    const opts = getOptions(vastChain, options);

    validateChain(vastChain, opts);

    VASTAdResponse.XML = await fetchAdXML(adTag, options);
    VASTAdResponse.parsedXML = parseVASTXML(VASTAdResponse.XML);
    VASTAdResponse.ad = getAd(VASTAdResponse.parsedXML);

    validateResponse(VASTAdResponse, opts);

    if (isWrapper(VASTAdResponse.ad)) {
      return requestAd(getVASTAdTagURI(VASTAdResponse.ad), opts, [VASTAdResponse, ...vastChain]);
    }

    return [VASTAdResponse, ...vastChain];
  } catch (error) {
    if (!Number.isInteger(error.errorCode)) {
      error.errorCode = 900;
    }

    VASTAdResponse.errorCode = error.errorCode;
    VASTAdResponse.error = error;

    return [VASTAdResponse, ...vastChain];
  }
};

export default requestAd;
