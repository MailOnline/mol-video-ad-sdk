import get from 'lodash/get';

/** @module mol-vast-selectors */

/**
 * Selects the ads of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Array} - Array of ads or null.
 * @static
 */
const getAds = (parsedVAST) => get(parsedVAST, 'elements[0].elements', null);

const isPodAd = (ad) => {
  const sequence = parseInt(ad.attributes.sequence, 10);

  return typeof sequence === 'number' && !isNaN(sequence);
};

/**
 * Checks if the passed array of ads have an ad pod.
 *
 * @param {Array} ads - Array of ads.
 * @returns {boolean} - Returns true if there is an ad pod in the array and false otherwise.
 */
const haveAdPod = (ads) => Boolean(ads.find(isPodAd));

const compareBySequence = (itemA, itemB) => {
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
const getFirstAd = (parsedVAST) => {
  const ads = getAds(parsedVAST);

  if (Array.isArray(ads)) {
    if (haveAdPod(ads)) {
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
const isWrapper = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'WRAPPER';

/**
 * Checks if the passed ad is an Inline.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains an Inline or `false` otherwise.
 * @static
 */
const isInline = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'INLINE';

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns the VASTAdTagURI from the wrapper ad or null otherwise.
 * @static
 */
const getVASTAdTagURI = (ad) => {
  const elements = get(ad, 'elements[0].elements', null);

  if (Array.isArray(elements)) {
    const VASTAdTagURIElement = elements.find(({name}) => name.toUpperCase() === 'VASTADTAGURI');

    return get(VASTAdTagURIElement, 'elements[0].cdata', null);
  }

  return null;
};

export {
  getAds,
  getFirstAd,
  getVASTAdTagURI,
  haveAdPod,
  isInline,
  isWrapper
};
