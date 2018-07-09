import SecureVideoAdContainer from './SecureVideoAdContainer';
import VideoAdContainer from './VideoAdContainer';

/**
   * VideoAdContainer factory method. Returns a VideoAdContainer instance that will contain the video ad.
   *
   * @function
   * @static
   * @param {HTMLElement} placeholder - Placeholder element that will contain the video ad.
   * @param {Object} options - Options Map. The allowed properties are:
   * @param {boolean} [options.secure] - flag that indicates whether to use a SecureVideoAdContainer or a normal VideoAdContainer.
   *  Defaults to true.
   * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
   *
   * @returns {VideoAdContainer|SecureVideoAdContainer} - Returns a `VideoAdContainer` or `SecureVideoAdContainer` instance.
   */
const createVideoAdContainer = (placeholder, options = {}) => {
  const {
    secure = false,
    videoElement
  } = options;

  if (secure) {
    return new SecureVideoAdContainer(placeholder, videoElement).ready();
  }

  return new VideoAdContainer(placeholder, videoElement).ready();
};

export default createVideoAdContainer;
