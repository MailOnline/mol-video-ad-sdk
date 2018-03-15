/** @module vast-selectors */
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

const getBooleanValue = (val) => {
  if (typeof val === 'string') {
    return val === 'true';
  }

  return Boolean(val);
};

const compareBySequence = (itemA, itemB) => {
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
 * From [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}:
 *
 * Sometimes ad servers would like to collect metadata from the video player when tracking
 * event URIs are accessed. For example, the position of the video player playhead at the time
 * a tracking event URI is accessed is useful to the ad server and is data that can only be
 * known at the time of the prescribed tracking event. This data cannot be built into the URI at
 * the time the VAST response is built and served.
 *
 * The following macros enable the video player to provide certain details to the ad server at
 * the time tracking URIs are accessed.
 *  * *[ERRORCODE]*: replaced with one of the error codes listed in section 2.3.6.3 when the
 * associated error occurs; reserved for error tracking URIs.
 *  * *[CONTENTPLAYHEAD]*: replaced with the current time offset “HH:MM:SS.mmm” of the
 * video content.
 *  * *[CACHEBUSTING]*: replaced with a random 8-digit number.
 *  * *[ASSETURI]*: replaced with the URI of the ad asset being played.
 *  * *[TIMESTAMP]*: the date and time at which the URI using this macro is accessed.
 * Used where ever a time stamp is needed, the macro is replaced with the date and
 * time using the formatting conventions of ISO 8601. However, ISO 8601 does not
 * provide a convention for adding milliseconds. To add milliseconds, use the
 * convention .mmm at the end of the time provided and before any time zone
 * indicator. For example, January 17, 2016 at 8:15:07 and 127 milleseconds, Eastern
 * Time would be formatted as follows: 2016-01-17T8:15:07.127-05
 * When replacing macros, the video player must correctly percent-encode any characters as
 * defined by RFC 3986.
 * VAST doesn’t provide any guidance on URI format, but using the [CACHEBUSTING] macro
 * simplifies trafficking, enabling ad servers to easily search and replace the appropriate
 * macro for cache busting.
 *
 * @typedef VAST-macro
 * @type {string}
 * @global
 */

// TODO: properly link @mol/vast-xml2js
/**
 * JS XML deserialised object using @mol/vast-xml2js
 *
 * @typedef ParsedVast
 * @type Object
 *
 * @global
 */

/**
 * Deserialised ad object from a [parsedVast]{@link module:vast-selectors~parsedVast} object.
 *
 * @typedef ParsedAd
 * @type Object
 *
 * @global
 */

/**
 * Selects the ads of the passed VAST.
 *
 * @function
 * @param {ParsedVast} parsedVAST - Parsed VAST xml.
 * @returns {?Array} - Array of ads or `null`.
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
 * @function
 * @param {ParsedVast} parsedVAST - Parsed VAST xml.
 * @returns {?VAST-macro} - Vast Error URI or `null` otherwise.
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
 * @function
 * @param {ParsedAd} ad - Parsed ad definition object.
 * @returns {?number} - The pod ad sequence number or `null`.
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
 * @function
 * @param {ParsedAd} ad - Parsed ad definition object.
 * @returns {?boolean} - Returns true if there the ad is a pod ad and false otherwise.
 */
export const isPodAd = (ad) => Boolean(getPodAdSequence(ad));

/**
 * Checks if the passed array of ads have an ad pod.
 *
 * @function
 * @param {ParsedVAST} parsedVAST - Parsed VAST xml.
 * @returns {?boolean} - Returns true if there is an ad pod in the array and false otherwise.
 */
export const hasAdPod = (parsedVAST) => {
  const ads = getAds(parsedVAST);

  return Array.isArray(ads) && ads.filter(isPodAd).length > 1;
};

/**
 * Selects the first ad of the passed VAST. If the passed VAST response contains an ad pod it will return the first ad in the ad pod sequence.
 *
 * @function
 * @param {ParsedVAST} parsedVAST - Parsed VAST xml.
 * @returns {?ParsedAd} - First ad of the VAST xml or `null`.
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
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {boolean} - `true` if the ad contains a wrapper and `false` otherwise.
 * @static
 */
export const isWrapper = (ad = {}) => Boolean(get(ad || {}, 'Wrapper'));

/**
 * Checks if the passed ad is an Inline.
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {boolean} - Returns `true` if the ad contains an Inline or `false` otherwise.
 * @static
 */
export const isInline = (ad) => Boolean(get(ad || {}, 'Inline'));

/**
 * Returns the VASTAdTagURI from the wrapper ad.
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?string} - Returns the VASTAdTagURI from the wrapper ad or `null` otherwise.
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
 * Wrapper ad options.
 *
 * @typedef WrapperOptions
 * @type Object
 * @property {boolean} [allowMultipleAds] - a Boolean value that identifies whether multiple ads are allowed in the
 * requested VAST response. If true, both Pods and stand-alone ads are
 * allowed. If false, only the first stand-alone Ad (with no sequence values)
 * in the requested VAST response is allowed. Default value is “false.”
 * @property {boolean} [fallbackOnNoAd] - a Boolean value that provides instruction for using an available Ad when
 * the requested VAST response returns no ads. If true, the video player
 * should select from any stand-alone ads available. If false and the Wrapper
 * represents an Ad in a Pod, the video player should move on to the next Ad
 * in a Pod; otherwise, the video player can follow through at its own
 * discretion where no-ad responses are concerned.
 * @property {boolean} [followAdditionalWrappers] - s a Boolean value that identifies whether subsequent wrappers after a
 * requested VAST response is allowed. If false, any Wrappers received (i.e.
 * not an Inline VAST response) should be ignored. Otherwise, VAST
 * Wrappers received should be accepted (default value is “true.”)
 *
 * @global
 */

/**
 * Returns the options from the wrapper ad.
 *
 * @function
 * @param {Object} ad - VAST ad object.
 * @returns {WrapperOptions} - Returns the options from the wrapper ad.
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
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?string} - Vast ad Error URI or `null` otherwise.
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
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?string} - Vast ad Impression URI or `null` otherwise.
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

/**
 * VAST MediaFile representation.
 * For more info please take a look at the [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
 *
 * @global
 * @typedef MediaFile
 * @type Object
 * @property {string} [codec] - The codec used to encode the file which can take values as specified by [RFC 4281]{@link http://tools.ietf.org/html/rfc4281}.
 * @property {string} [delivery] - Either `progressive` for progressive download protocols (such as HTTP) or `streaming` for streaming protocols.
 * @property {number} [height] - The native height of the video file, in pixels.
 * @property {string} [id] - An identifier for the media file.
 * @property {string} [maintainAspectRatio] - Boolean value that indicates whether aspect ratio for media file dimensions
 *  should be maintained when scaled to new dimensions
 * @property {string} [bitrate] - For progressive load video, the bitrate value specifies the average bitrate for the media file
 * @property {string} [maxBitrate] - max bitrate for streaming videos.
 * @property {string} [minBitrate] - min bitrate for streaming videos.
 * @property {string} [scalable] - Boolean value that indicates whether the media file is meant to scale to larger dimensions
 * @property {string} [src] - The source file url.
 * @property {string} [type] - MIME type for the file container. Popular MIME types include,
 * but are not limited to “video/x-flv” for Flash Video and “video/mp4” for MP4.
 * @property {number} [width] - The native width of the video file, in pixels.
 * @property {string} [universalAdId] - A string identifying the unique creative identifier.
 */

/**
 * Gets the ads MediaFiles.
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?Array.<MediaFile>} - array of media files or null
 */
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

/**
 * Gets the click through {@link VAST-macro}.
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?VAST-macro} - clickthrough macro
 */
export const getClickThrough = (ad) => {
  const videoClicksElement = getVideoClicksElement(ad);
  const clickThroughElement = videoClicksElement && get(videoClicksElement, 'ClickThrough');

  if (clickThroughElement) {
    return getText(clickThroughElement);
  }

  return null;
};

/**
 * Gets the click through {@link VAST-macro}.
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @returns {?Array.<VAST-macro>} - click tracking mavro macro
 */
export const getClickTracking = (ad) => {
  const videoClicksElement = getVideoClicksElement(ad);
  const clickTrackingElement = videoClicksElement && get(videoClicksElement, 'ClickTracking');

  // TODO: MUST RETURN AN ARRAY

  if (clickTrackingElement) {
    return getText(clickTrackingElement);
  }

  return null;
};

/**
 * The parsed time offset in milliseconds or a string with the percentage
 *
 * @typedef ParsedOffset
 * @global
 */

/**
 * Gets the skipoffset.
 *
 * @function
 * @param {Object} ad - VAST ad object.
 * @returns {?ParsedOffset} - the time offset in milliseconds or a string with the percentage or null
 */
export const getSkipOffset = (ad) => {
  const creativeElement = ad && getLinearCreative(ad);
  const linearElement = creativeElement && get(creativeElement, 'Linear');
  const skipoffset = linearElement && getAttribute(linearElement, 'skipoffset');

  if (skipoffset) {
    return parseOffset(skipoffset);
  }

  return null;
};

export {

  /**
   * Gets the Vast Icon definitions from the Vast Ad
   *
   * @function
   * @param {ParsedAd} ad - VAST ad object.
   * @returns {?Array.<VastIcon>} - Array of VAST icon definitions
   */
  getIcons,

  /**
   * VastTrackingEvent.
   * For more info please take a look at the [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
   *
   * @global
   * @typedef VastTrackingEvent
   * @type Object
   *
   * @property {string} [event] - A string that defines the event being track.
   * @property {ParsedOffset} [offset] - When the progress of the linear creative has matched the value specified, the included URI is triggered
   * @property {string} [uri] - A URI to the tracking resource for the event specified using the event attribute
   *
   */

  /**
   * Gets the Linear tracking events from the Vast Ad
   *
   * @function
   * @param {ParsedAd} ad - VAST ad object.
   * @param {string} [eventName] - If provided it will filter-out the array events against it.
   * @returns {?Array.<VastTrackingEvent>} - Array of Tracking event definitions
   */
  getLinearTrackingEvents
};
