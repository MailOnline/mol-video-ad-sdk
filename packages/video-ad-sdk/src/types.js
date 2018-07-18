/* eslint-disable import/unambiguous */

/**
 * An Object representing a processed VAST response.
 * @global
 * @typedef {Object} VastResponse
 * @property {Object} ad - The selected ad extracted from the passed XML.
 * @property {Object} parsedXML - The XML parsed object.
 * @property {number} errorCode - VAST error code number to identify the error or null if there is no error.
 * @property {Error} error - Error instance with a human readable description of the error or undefined if there is no error.
 * @property {string} requestTag - Ad tag that was used to get this `VastResponse`.
 * @property {string} XML - RAW XML as it came from the server.
 */

/**
 * Array of {@link VastResponse} sorted backwards. Last response goes first.
 * Represents the chain of VAST responses that ended up on a playable video ad or an error.
 *
 * @global
 * @typedef VastChain
 * @type Array.<VastResponse>
 */

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
 * indicator. For example, January 17, 2016 at 8:15:07 and 127 milliseconds, Eastern
 * Time would be formatted as follows: 2016-01-17T8:15:07.127-05
 * When replacing macros, the video player must correctly percent-encode any characters as
 * defined by RFC 3986.
 * VAST doesn’t provide any guidance on URI format, but using the [CACHEBUSTING] macro
 * simplifies trafficking, enabling ad servers to easily search and replace the appropriate
 * macro for cache busting.
 *
 * @global
 * @typedef VAST-macro
 * @type {string}
 */

/**
 * JS XML deserialised object.
 *
 * @global
 * @typedef ParsedVast
 * @type Object
 *
 */

/**
 * Deserialised ad object from a [parsedVast]{@link module:vast-selectors~parsedVast} object.
 *
 * @global
 * @typedef ParsedAd
 * @type Object
 *
 */

/**
 * VastIcon.
 * For more info please take a look at the [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
 *
 * @global
 * @typedef VastIcon
 * @type Object
 *
 * @property {ParsedOffset} [offset] - The time of delay from when the associated linear creative begins playing to when the icon should be displayed.
 * @property {ParsedOffset} [duration] - The duration the icon should be displayed unless ad is finished playing.
 * @property {number} [height] - Pixel height of the icon.
 * @property {number} [width] - Pixel width of the icon.
 * @property {string} [program] - The program represented in the icon (e.g. "AdChoices").
 * @property {number} [pxratio] - The pixel ratio for which the icon creative is intended.
 *                                The pixel ratio is the ratio of physical pixels on the device to the device-independent pixels.
 *                                An ad intended for display on a device with a pixel ratio that is twice that of a standard 1:1 pixel ratio would use the value "2."
 *                                Default value is "1.".
 * @property {string|number} [xPosition] - The x-coordinate of the top, left corner of the icon asset relative to the ad display area.
 *                                Values of "left" or "right" also accepted and indicate the leftmost or rightmost available position for the icon asset.
 * @property {string|number} [yPosition] - The y-coordinate of the top left corner of the icon asset relative to the ad display area.
 *                                Values of "top" or "bottom" also accepted and indicate the topmost or bottom most available position for the icon asset
 * @property {string} [staticResource] - The URI to a static creative file to be used as the icon.
 * @property {string} [htmlResource] - The URI to a static creative file to be used as the icon.
 * @property {string} [iFrameResource] - The URI to a static creative file to be used as the icon.
 * @property {Array.<string>} [iconViewTracking] - Array of URIs for the tracking resource files to be called when the icon creative is displayed
 * @property {string} [iconClickThrough] - A URI to the industry program page opened when a viewer clicks the icon.
 * @property {Array.<string>} [iconClickTracking] - Array of URIs to the tracking resource files to be called when a click corresponding to the id attribute (if provided) occurs.
 *
 */

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
 * The parsed time offset in milliseconds or a string with the percentage
 *
 * @global
 * @typedef ParsedOffset
 */

/**
 * Wrapper ad options.
 *
 * @global
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
 */

/**
 * Function to track VAST events.
 *
 * @global
 * @typedef {function} tracker
 * @name tracker
 * @description Tracking function.
 * @param {string} URLMacro - URL Macro that need to be tracked.
 * @param {Object} data - data to use for the URL Macro.
 */
