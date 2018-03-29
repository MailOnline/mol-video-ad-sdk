/** @module video-ad-tracker */
import linearEvents from './linearEvents';
import trackLinearEvent from './trackLinearEvent';
import pixelTracker from './helpers/pixelTracker';
import trackError from './helpers/trackError';

export {

  /**
   * @see LinearEvents
   */
  linearEvents,

  /**
   * Creates a tracking image with the passed URL macro.
   *
   * @param {string} URLMacro - URL Macro that need to be tracked.
   * @param {Object} data - Data Object with the macros's variables.
   * @returns {HTMLImageElement} - Image element whose source is the parsed URL Macro.
   * @static
   */
  pixelTracker,

  /**
   * Function to track VAST events.
   *
   * @typedef {function} tracker
   * @global
   * @name tracker
   * @description Tracking function.
   * @param {string} URLMacro - URL Macro that need to be tracked.
   * @param {Object} data - data to use for the URL Macro.
   */

  /**
   * Tracks the passed event.
   *
   * @param {string} event - name of the linear event we need to track. @see LinearEvents
   * @param {VASTChain} vastChain - the ad VAST Chain.
   * @param {Object} options - Options Map. The allowed properties are:
   * @param {Object} [options.logger] - Optional logger instance.
   *                                    Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   *                                    Defaults to console.
   * @param {Object} [options.data] - additional data for the URL macro. See [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
   * @param {tracker} [options.tracker] - optional tracker to use for the actual tracking. Defaults to the pixel tracker.
   * @param {string} [options.errorCode] - error code. Needed if we are tracking an error.
   */
  trackLinearEvent,

  /**
   * Tracks an error.
   *
   * @param {VASTChain} vastChain - the ad VAST Chain.
   * @param {Object} options - Options Map. The allowed properties are:
   * @param {Object} [options.logger] - Optional logger instance.
   *                                    Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   *                                    Defaults to console.
   * @param {tracker} [options.tracker] - optional tracker to use for the actual tracking. Defaults to the pixel tracker.
   * @param {string} [options.errorCode] - error code. Needed if we are tracking an error.
   */
  trackError
};
