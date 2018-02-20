import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from '@mol/vast-xml2js';
import parseOffset from './helpers/parseOffset';
import getLinearCreative from './helpers/getLinearCreative';
import getLinearTrackingEvents from './getLinearTrackingEvents';
import getIcons from './getIcons';

export const getBooleanValue = (val) => {
  if (typeof val === 'string') {
    return val === 'true';
  }

  return Boolean(val);
};

export const compareBySequence = (itemA, itemB) => {
  const itemASequence = parseInt(getAttribute(itemA, 'sequence'), 10);
  const itemBSequence = parseInt(getAttribute(itemB, 'sequence'), 10);

  if (itemASequence < itemBSequence) {
    return -1;
  }

  if (itemASequence > itemBSequence) {
    return 1;
  }

  return 0;
};

/**
 * Selects the ads of the passed VAST.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Array} - Array of ads or null.
 * @static
 */
export const getAds = (parsedVAST) => {
  const vastElement = parsedVAST && get(parsedVAST, 'VAST');
  const ads = vastElement && getAll(vastElement, 'Ad');

  if (ads && ads.length > 0) {
    return ads;
  }

  return null;
};

/**
 * Gets the Error URI of the passed parsed VAST xml.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {String/null} - Vast Error URI or null otherwise.
 * @static
 */
export const getVastErrorURI = (parsedVAST) => {
  const vastElement = parsedVAST && get(parsedVAST, 'VAST');

  if (vastElement) {
    const error = get(vastElement, 'Error');

    if (error) {
      return getText(error);
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
  const sequence = parseInt(getAttribute(ad, 'sequence'), 10);

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

/**
 * Selects the first ad of the passed VAST. If the passed VAST response contains an ad pod it will return the first ad in the ad pod sequence.
 *
 * @param {Object} parsedVAST - Parsed VAST xml.
 * @returns {Object} - First ad of the VAST xml or null.
 * @static
 */
export const getFirstAd = (parsedVAST) => {
  const ads = getAds(parsedVAST);

  if (Array.isArray(ads) && ads.length > 0) {
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
export const isWrapper = (ad = {}) => Boolean(get(ad || {}, 'Wrapper'));

/**
 * Checks if the passed ad is an Inline.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains an Inline or `false` otherwise.
 * @static
 */
export const isInline = (ad) => Boolean(get(ad || {}, 'Inline'));

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {boolean} - Returns the VASTAdTagURI from the wrapper ad or null otherwise.
 * @static
 */
export const getVASTAdTagURI = (ad) => {
  const wrapperElement = get(ad, 'Wrapper');
  const vastAdTagURIElement = wrapperElement && get(wrapperElement, 'VastAdTagUri');

  if (vastAdTagURIElement) {
    return getText(vastAdTagURIElement) || null;
  }

  return null;
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
  } = getAttributes(get(ad, 'Wrapper'));

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

/**
 * Gets the Error URI of the passed ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {String/null} - Vast ad Error URI or null otherwise.
 * @static
 */
export const getAdErrorURI = (ad) => {
  const adTypeElement = ad && getFirstChild(ad);

  if (adTypeElement) {
    const error = get(adTypeElement, 'Error');

    if (error) {
      return getText(error);
    }
  }

  return null;
};

/**
 * Gets the Impression URI of the passed ad.
 *
 * @param {Object} ad - VAST ad object.
 * @returns {String/null} - Vast ad Impression URI or null otherwise.
 * @static
 */
export const getImpressionUri = (ad) => {
  const adTypeElement = ad && getFirstChild(ad);

  if (adTypeElement) {
    const impression = get(adTypeElement, 'Impression');

    if (impression) {
      return getText(impression);
    }
  }

  return null;
};

export const getMediaFiles = (ad) => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const universalAdIdElement = get(creativeElement, 'UniversalAdId');
    const universalAdId = universalAdIdElement && getText(universalAdIdElement) || null;
    const linearElement = get(creativeElement, 'Linear');
    const mediaFilesElement = get(linearElement, 'MediaFiles');
    const mediaFileElements = mediaFilesElement && getAll(mediaFilesElement, 'MediaFile');

    if (mediaFileElements && mediaFileElements.length > 0) {
      return mediaFileElements.map((mediaFileElement) => {
        const src = getText(mediaFileElement);
        const {
          bitrate,
          codec,
          delivery,
          height,
          id,
          maintainAspectRatio,
          maxBitrate,
          minBitrate,
          scalable,
          type,
          width
        } = getAttributes(mediaFileElement);

        return {
          bitrate,
          codec,
          delivery,
          height,
          id,
          maintainAspectRatio,
          maxBitrate,
          minBitrate,
          scalable,
          src,
          type,
          universalAdId,
          width
        };
      });
    }

    return null;
  }

  return null;
};

const getVideoClicksElement = (ad) => {
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const videoClicksElement = linearElement && get(linearElement, 'VideoClicks');

  if (videoClicksElement) {
    return videoClicksElement;
  }

  return null;
};

export const getClickThrough = (ad) => {
  const videoClicksElement = getVideoClicksElement(ad);
  const clickThroughElement = videoClicksElement && get(videoClicksElement, 'ClickThrough');

  if (clickThroughElement) {
    return getText(clickThroughElement);
  }

  return null;
};

export const getClickTracking = (ad) => {
  const videoClicksElement = getVideoClicksElement(ad);
  const clickTrackingElement = videoClicksElement && get(videoClicksElement, 'ClickTracking');

  if (clickTrackingElement) {
    return getText(clickTrackingElement);
  }

  return null;
};

export const getSkipoffset = (ad) => {
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const skipoffset = linearElement && getAttribute(linearElement, 'skipoffset');

  if (skipoffset) {
    return parseOffset(skipoffset);
  }

  return null;
};

export {
  getIcons,
  getLinearTrackingEvents
};