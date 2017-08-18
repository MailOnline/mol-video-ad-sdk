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

/**
 * Selects the first ad of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Object} - First ad of the VAST xml or null.
 * @static
 */
const getFirstAd = (parsedVAST) => get(parsedVAST, 'elements[0].elements[0]', null);

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
  isInline,
  isWrapper
};
