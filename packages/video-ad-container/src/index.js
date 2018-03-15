/** @module video-ad-container */
import VideoAdContainer from './VideoAdContainer';
import SecureVideoAdContainer from './SecureVideoAdContainer';
import createVideoAdContainer from './createVideoAdContainer';

export {

  /**
   * VideoAdContainer factory method. Returns a VideoAdContainer instance that will contain the video ad.
   * @function
   * @static
   * @param {HTMLElement} placeholder - Placeholder element that will contain the video ad.
   * @param {Object} options - Options Map. The allowed properties are:
   * @param {boolean} [options.secure] - flag that indicates whether to use a SecureVideoAdContainer or a normal VideoAdContainer.
   *  Defaults to false.
   * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
   * @param {Object} [options.logger] - Optional logger instance.
   *                                    Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   *                                    Defaults to console.
   *
   * @returns {VideoAdContainer|SecureVideoAdContainer} - Returns a `VideoAdContainer` or `SecureVideoAdContainer` instance.
   */
  createVideoAdContainer,

  /**
   * @see VideoAdContainer
   */
  VideoAdContainer,

  /**
   * @see SecureVideoAdContainer
   */
  SecureVideoAdContainer
};
