/* eslint-disable promise/prefer-await-to-then */
import loadScript from './helpers/loadScript';
import createAdVideoElement from './helpers/createAdVideoElement';

const createAdContainer = () => {
  const adContainer = document.createElement('DIV');

  adContainer.classList.add('mol-video-ad-container');
  adContainer.style.width = '100%';
  adContainer.style.height = '100%';

  return adContainer;
};

const createAdContainerIframe = () => {
  const iframe = document.createElement('IFRAME');

  iframe.src = 'about:blank';
  iframe.sandbox = 'allow-forms allow-popups allow-scripts';

  return iframe;
};
const iframeElementKey = Symbol('iframeElement');
const readyPromiseKey = Symbol('readyPromiseKey');
const destroyed = Symbol('destroyed');

const getContentDocument = (iframeElement) => iframeElement.contentDocument || iframeElement.contentWindow.document;

/**
 * @class
 * @global
 * @description This class provides everyting necesary to contain and create a video ad within a given placeholder Element.
 * On a secure way i.e. within an Iframe.
 * @augments VideoAdContainer
 */
class SecureVideoAdContainer {
  /**
   * Creates a SecureVideoAdContainer.
   *
   * @param {HTMLDivElement} placeholder - DIV that will contain the ad.
   * @param {HTMLVideoElement} [videoElement] - optional videoElement that will be used to play the ad.
   */
  constructor (placeholder, videoElement = null) {
    if (!(placeholder instanceof Element)) {
      throw new TypeError('placeholder is not an Element');
    }

    this.context = null;
    this.videoElement = videoElement;
    this.element = createAdContainer();

    const iframeElement = createAdContainerIframe();

    this[readyPromiseKey] = new Promise((resolve, reject) => {
      iframeElement.addEventListener('error', reject);
      iframeElement.addEventListener('load', resolve);
    })
      .then(() => {
        const iframeDocument = getContentDocument(iframeElement);

        this[iframeElementKey] = iframeElement;
        this.context = iframeElement.contentWindow;

        if (!this.videoElement) {
          this.videoElement = createAdVideoElement(iframeDocument);
          iframeDocument.body.appendChild(this.videoElement);
        }

        this.resize();

        return this;
      });

    this.element.appendChild(iframeElement);
    placeholder.appendChild(this.element);
    this[destroyed] = false;
  }

  /**
   * Returns a promise that will resolve once the VideoAdContainer is ready to be used.
   *
   * @returns Promise<VideoAdContainer> - resolves with itself.
   */
  ready () {
    return this[readyPromiseKey];
  }

  /*
   * Reszie the container.
   * Call this method whenever you need to do a manual resize and are not sure that the change will be automatically picked.
   */
  resize () {
    if (this.isDestroyed()) {
      throw new Error('SecureVideoAdContainer has been destroyed');
    }

    const iframeElement = this[iframeElementKey];
    const {clientHeight, clientWidth} = this.element;

    iframeElement.width = `${clientWidth}px`;
    iframeElement.height = `${clientHeight}px`;
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
      throw new Error('SecureVideoAdContainer has been destroyed');
    }

    const placeholder = getContentDocument(this[iframeElementKey]).body;

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
}

export default SecureVideoAdContainer;
