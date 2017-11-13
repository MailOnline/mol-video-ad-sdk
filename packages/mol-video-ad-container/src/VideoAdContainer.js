import {onElementResize} from 'mol-element-observers';
import loadScript from './helpers/loadScript';
import createAdVideoElement from './helpers/createAdVideoElement';

const isVideoElement = (video) => video instanceof HTMLMediaElement;
const createAdContainer = () => {
  const adContainer = document.createElement('DIV');

  adContainer.classList.add('mol-video-ad-container');
  adContainer.style.width = '100%';
  adContainer.style.height = '100%';

  return adContainer;
};
const stopOnResizeObserver = Symbol('stopOnResizeObserver');
const onResizeCallbacks = Symbol('onResizeCallbacks');

/** Contains everyting necesary to contain and create a video ad within a given placeholder Element. */
class VideoAdContainer {
  /**
   * Create a VideoAdContainer instance.
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
      Context the ad will run on. I.E. The `window` of the ads runing environment.

      @name VideoAdContainer#context
    */
    this.context = window;

    /**
      Element node that will expand using all the available space on the placeholder element

      @name VideoAdContainer#element
      @type HTMLElement
    */
    this.element = createAdContainer();

    /**
      The video element that will play the video ad.

      @name VideoAdContainer#videoElement
      @type HTMLVideoElement
    */
    this.videoElement = isVideoElement(videoElement) ? videoElement : createAdVideoElement();

    placeholder.appendChild(this.element);

    if (!isVideoElement(videoElement)) {
      this.element.appendChild(this.videoElement);
    }
  }

  /**
   * Returns apromise that will resolve once the VideoAdContainer is ready to be used.
   *
   * @returns Promise<VideoAdContainer> - resolves with itself.
   */
  ready () {
    return Promise.resolve(this);
  }

  /**
   * Will call the passed callback whenever the VideoAdContainer resizes.
   *
   * @param {Function} callback - To be call on resize.
   */
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  onResize (callback) {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed');
    }

    if (!this[stopOnResizeObserver]) {
      this[onResizeCallbacks] = [];
      const callOnResizeCallbacks = () => this[onResizeCallbacks].forEach((onResizeCallback) => onResizeCallback());

      this[stopOnResizeObserver] = onElementResize(this.element, callOnResizeCallbacks);
    }

    this[onResizeCallbacks].push(callback);

    return () => {
      this[onResizeCallbacks] = this[onResizeCallbacks].filter((onResizeCallback) => onResizeCallback !== callback);
    };
  }

  /**
   * Adds the passed script to the ad container.
   *
   * @param {string} src - script source uri.
   * @param {Object} options - Options map.
   * @param {string} options.type - Defaults to 'text/javascript'.
   * @param {boolean} options.async - if "true" the "async" attribute is added to the new script. Defaults to false.
   * @param {boolean} options.defer - if "true" the "defer" attribute is added to the new script. Defaults to true.
   * @param {HTMLElement} options.placeholder - Element that should contain the script. Defaults to {@link VideoAdContainer#element}.
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
    this.element = null;
    this.context = null;
    this.videoElement = null;

    if (this[stopOnResizeObserver]) {
      this[stopOnResizeObserver]();

      this[onResizeCallbacks] = null;
      this[stopOnResizeObserver] = null;
    }
  }

  /**
   * Checks if the container is destroyed.
   *
   * @returns {boolean} - true if the container is destroyed and false otherwise.
   */
  isDestroyed () {
    return !Boolean(this.element);
  }

  /*
    Call this method whenever you need to do a manual resize and are not sure that the change will be automatically picked.
  */
  resize () {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed');
    }

    // Video ad containers resize automatically to the size of the placeholder
  }
}

export default VideoAdContainer;
