import loadScript from './helpers/loadScript';
import createAdVideoElement from './helpers/createAdVideoElement';

const createAdContainer = () => {
  const adContainer = document.createElement('DIV');

  adContainer.classList.add('mol-video-ad-container');
  adContainer.style.width = '100%';
  adContainer.style.height = '100%';

  return adContainer;
};
const destroyed = Symbol('destroyed');

/**
 * @class
 * @global
 * @description Contains everything necessary to contain and create a video ad within a given placeholder Element.
 */
class VideoAdContainer {
  /**
   * Creates a VideoAdContainer.
   *
   * @param {HTMLDivElement} placeholder - DIV that will contain the ad.
   * @param {Object} options - Options Map.
   * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
   */
  constructor (placeholder, {videoElement = null} = {}) {
    if (!(placeholder instanceof Element)) {
      throw new TypeError('placeholder is not an Element');
    }

    /**
     * Context the ad will run on. I.E. The `window` of the ads runing environment.
     *
     * @name VideoAdContainer#context
     */
    this.context = window;

    /**
     * Element node that will expand using all the available space on the placeholder element
     *
     * @name VideoAdContainer#element
     * @type HTMLElement
     */
    this.element = createAdContainer();

    /**
     * The video element that will play the video ad.
     *
     * @name VideoAdContainer#videoElement
     * @type HTMLVideoElement
    */
    this.videoElement = videoElement ? videoElement : createAdVideoElement();

    placeholder.appendChild(this.element);

    if (!videoElement) {
      this.element.appendChild(this.videoElement);
    }

    this[destroyed] = false;
  }

  /**
   * Returns a promise that will resolve once the VideoAdContainer is ready to be used.
   *
   * @returns Promise<VideoAdContainer> - resolves with itself.
   */
  ready () {
    return Promise.resolve(this);
  }

  /**
   * Adds the passed script to the ad container.
   *
   * @param {string} src - script source uri.
   * @param {Object} options - Options map.
   * @param {string} options.type - Defaults to 'text/javascript'.
   * @param {boolean} options.async - if "true" the "async" attribute is added to the new script. Defaults to false.
   * @param {boolean} options.defer - if "true" the "defer" attribute is added to the new script. Defaults to true.
   */
  addScript (src, options = {}) {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed');
    }

    const placeholder = options.placeholder || this.element;

    return loadScript(src, {
      defer: true,
      placeholder,
      ...options
    });
  }

  /**
   * Destroys the VideoAdContainer.
   */
  destroy () {
    this.element.parentNode.removeChild(this.element);
    this[destroyed] = true;
  }

  /**
   * Checks if the container is destroyed.
   *
   * @returns {boolean} - true if the container is destroyed and false otherwise.
   */
  isDestroyed () {
    return this[destroyed];
  }

  /*
    This method is not really needed just here to keep the same interface than {@link SecureVideoAdContainer}
  */
  resize () {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed');
    }

    // Video ad containers resize automatically to the size of the placeholder
  }
}

export default VideoAdContainer;
