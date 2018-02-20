import SecureVideoAdContainer from './SecureVideoAdContainer';
import VideoAdContainer from './VideoAdContainer';

/**
 * VideoAdContainer factory method. Returns a VideoAdContainer instance that will contain the video ad.
 *
 * @param {HTMLElement} placeholder - Placeholder element that will contain the video ad.
 * @param {Object} options - Options Map. The allowed properties area:
 *                           * [`secure`] flag that indicates whether to use a SecureVideoAdContainer or a normal VideoAdContainer.
 *                              Defaults to false.
 *                           * [`VideoElement`] - HTMLVideoElement node to use to play the ad.
 *                           * [`logger`] - logger instance.
 *                              Defaults to `console`.
 *                           * [`dynamicResize`] - flag to tell the VideoAdContainer to resize on whenever the placeholder changes its size.
 *                              Defaults to true.
 *
 * @returns {VideoAdContainer/SecureVideoAdContainer} - Returns a `VideoAdContainer` or `SecureVideoAdContainer` instance.
 */
const createVideoAdContainer = (placeholder, options = {}) => {
  const {secure = false} = options;

  if (secure) {
    return new SecureVideoAdContainer(placeholder, options).ready();
  }

  return new VideoAdContainer(placeholder, options).ready();
};

export default createVideoAdContainer;
