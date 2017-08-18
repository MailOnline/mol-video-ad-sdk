import get from 'lodash/get';

/**
 * Selects the ads of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Array} - Array of ads or null.
 */
const getAds = (parsedVAST) => get(parsedVAST, 'elements[0].elements', null);

/**
 * Selects the first ad of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Object} - First ad of the VAST xml or null.
 */
const getFirstAd = (parsedVAST) => get(parsedVAST, 'elements[0].elements[0]', null);

/**
 * Checks if the passed ad is a Wrapper.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains a wrapper or `false` otherwise.
 */
const isWrapper = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'WRAPPER';

/**
 * Checks if the passed ad is an Inline.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains an Inline or `false` otherwise.
 */
const isInline = (ad) => get(ad, 'elements[0].name', '').toUpperCase() === 'INLINE';

export {
  getAds,
  getFirstAd,
  isInline,
  isWrapper
};
