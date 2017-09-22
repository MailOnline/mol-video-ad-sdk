import get from 'lodash/get';

/** @module mol-vast-selectors */

/**
 * Selects the ads of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Array} - Array of ads or null.
 * @static
 */
export const getAds = (parsedVAST) => {
  const elements = get(parsedVAST, 'elements[0].elements', null);

  if (elements) {
    const ads = elements.filter(({name}) => name.toUpperCase() === 'AD');

    if (ads.length > 0) {
      return ads;
    }
  }

  return null;
};

/**
 * Gets the sequence of the pod ad.
 *
 * @param {Object} ad - Parsed ad definition object.
 * @returns {number} - The pod ad sequence number or null.
 */
export const getPodAdSequence = (ad) => {
  const sequence = ad && ad.attributes && parseInt(ad.attributes.sequence, 10);

  if (typeof sequence === 'number' && !isNaN(sequence)) {
    return sequence;
  }

  return null;
};

/**
 * Checks if the passed ad definition is a pod ad.
 *
 * @param {Object} ad - Parsed ad definition object.
 * @returns {boolean} - Returns true if there the ad is a pod ad and false otherwise.
 */
export const isPodAd = (ad) => Boolean(getPodAdSequence(ad));

/**
 * Checks if the passed array of ads have an ad pod.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {boolean} - Returns true if there is an ad pod in the array and false otherwise.
 */
export const hasAdPod = (parsedVAST) => {
  const ads = getAds(parsedVAST);

  return Array.isArray(ads) && ads.filter(isPodAd).length > 1;
};

export const compareBySequence = (itemA, itemB) => {
  const itemASequence = parseInt(itemA.attributes.sequence, 10);
  const itemBSequence = parseInt(itemB.attributes.sequence, 10);

  if (itemASequence < itemBSequence) {
    return -1;
  }

  if (itemASequence > itemBSequence) {
    return 1;
  }

  return 0;
};

/**
 * Selects the first ad of the passed VAST. If the passed VAST response contains an ad pod it will return the first ad in the ad pod sequence.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Object} - First ad of the VAST xml or null.
 * @static
 */
export const getFirstAd = (parsedVAST) => {
  const ads = getAds(parsedVAST);

  if (Array.isArray(ads)) {
    if (hasAdPod(parsedVAST)) {
      return ads.filter(isPodAd)
        .sort(compareBySequence)[0];
    }

    return ads[0];
  }

  return null;
};

/**
 * Checks if the passed ad is a Wrapper.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains a wrapper or `false` otherwise.
 * @static
 */
export const isWrapper = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'WRAPPER';

/**
 * Checks if the passed ad is an Inline.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains an Inline or `false` otherwise.
 * @static
 */
export const isInline = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'INLINE';

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns the VASTAdTagURI from the wrapper ad or null otherwise.
 * @static
 */
export const getVASTAdTagURI = (ad) => {
  const elements = get(ad, 'elements[0].elements', null);

  if (Array.isArray(elements)) {
    const VASTAdTagURIElement = elements.find(({name}) => name.toUpperCase() === 'VASTADTAGURI');

    return get(VASTAdTagURIElement, 'elements[0].cdata', null);
  }

  return null;
};

const getBooleanValue = (val) => {
  if (typeof val === 'string') {
    return val === 'true';
  }

  return Boolean(val);
};

/**
 * Returns the options from the wrapper ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {Object} - Returns the options from the wrapper ad.
 * @static
 */
export const getWrapperOptions = (ad) => {
  const {
    allowMultipleAds,
    fallbackOnNoAd,
    followAdditionalWrappers
  } = get(ad, 'elements[0].attributes', {});
  const opts = {};

  if (allowMultipleAds) {
    opts.allowMultipleAds = getBooleanValue(allowMultipleAds);
  }

  if (fallbackOnNoAd) {
    opts.fallbackOnNoAd = getBooleanValue(fallbackOnNoAd);
  }

  if (followAdditionalWrappers) {
    opts.followAdditionalWrappers = getBooleanValue(followAdditionalWrappers);
  }

  return opts;
};
