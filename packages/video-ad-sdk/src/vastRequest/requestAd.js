import xml2js from '@mol/vast-xml2js';
import {
  getWrapperOptions,
  getFirstAd,
  getVASTAdTagURI,
  hasAdPod,
  isInline,
  isWrapper
} from '../vastSelectors';
import fetch from './helpers/fetch';
import {markAdAsRequested} from './helpers/adUtils';

const validateChain = (vastChain, {wrapperLimit = 5}) => {
  if (vastChain.length > wrapperLimit) {
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
      markAdAsRequested(ad);

      return ad;
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

  return {
    ...wrapperOptions,
    ...options
  };
};

// eslint-disable-next-line jsdoc/check-tag-names
/**
 * @function requestAd
 *
 * @memberof module:@mol/video-ad-sdk
 * @async
 * @static
 * @description Request the ad using the passed ad tag and returns an array with the [VAST responses]{@link VastResponse} needed to get an inline ad.
 *
 * @param {string} adTag - The VAST ad tag request url.
 * @param {Object} options - Options Map. The allowed properties are:
 * @param {number} [options.wrapperLimit] - Sets the maximum number of wrappers allowed in the {@link VastChain}.
 *  Defaults to `5`.
 * @param {boolean} [options.AllowMultipleAds] - Boolean to indicate whether adPods are allowed or not.
 *  Defaults to `true`.
 * @param {number} [options.timeout] - timeout number in milliseconds. If set, the request will timeout if it is not fulfilled before the specified time.
 * @param {VastChain} [vastChain] - Optional vastChain with the previous VAST responses.
 * @returns {Promise.<VastChain>} - Returns a Promise that will resolve with a VastChain with the newest VAST response at the beginning of the array.
 * If the {@link VastChain} had an error. The first VAST response of the array will contain an error and an errorCode entry.
 */
const requestAd = async (adTag, options, vastChain = []) => {
  const VASTAdResponse = {
    ad: null,
    errorCode: null,
    parsedXML: null,
    requestTag: adTag,
    XML: null
  };
  let opts;
  let epoch;
  let timeout;

  try {
    opts = getOptions(vastChain, options);
    validateChain(vastChain, opts);

    let fetchPromise = fetchAdXML(adTag, opts);

    if (typeof opts.timeout === 'number') {
      timeout = opts.timeout;
      epoch = Date.now();
      fetchPromise = Promise.race([
        fetchPromise,
        new Promise((resolve, reject) => {
          setTimeout(() => {
            const error = new Error('RequestAd timeout');

            error.errorCode = 301;
            reject(error);
          }, timeout);
        })
      ]);
    }

    VASTAdResponse.XML = await fetchPromise;
    VASTAdResponse.parsedXML = parseVASTXML(VASTAdResponse.XML);
    VASTAdResponse.ad = getAd(VASTAdResponse.parsedXML);

    validateResponse(VASTAdResponse, opts);

    if (isWrapper(VASTAdResponse.ad)) {
      if (epoch) {
        timeout -= Date.now() - epoch;
      }

      return requestAd(
        getVASTAdTagURI(VASTAdResponse.ad),
        {
          ...opts,
          timeout
        },
        [VASTAdResponse, ...vastChain]
      );
    }

    return [VASTAdResponse, ...vastChain];
  } catch (error) {
    /* istanbul ignore if */
    if (!Number.isInteger(error.errorCode)) {
      error.errorCode = 900;
    }

    VASTAdResponse.errorCode = error.errorCode;
    VASTAdResponse.error = error;

    return [VASTAdResponse, ...vastChain];
  }
};

export default requestAd;
