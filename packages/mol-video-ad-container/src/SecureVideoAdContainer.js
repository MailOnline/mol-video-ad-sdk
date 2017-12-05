/* eslint-disable promise/prefer-await-to-then */
import createAdVideoElement from './helpers/createAdVideoElement';
import VideoAdContainer from './VideoAdContainer';

const createAdContainerIframe = () => {
  const iframe = document.createElement('IFRAME');

  iframe.src = 'about:blank';
  iframe.sandbox = 'allow-forms allow-popups allow-scripts';

  return iframe;
};
const iframeElementKey = Symbol('iframeElement');
const readyPromiseKey = Symbol('readyPromiseKey');

const getContentDocument = (iframeElement) => iframeElement.contentDocument || iframeElement.contentWindow.document;

/**
 * This class provides everyting necesary to contain and create a video ad within a given placeholder Element.
 * On a secure way i.e. within an Iframe.
 *
 * @extends VideoAdContainer
 */
export default class SecureVideoAdContainer extends VideoAdContainer {
  /**
   * Creates a SecureVideoAdContainer.
   *
   * @param {HTMLDivElement} placeholder - DIV that will contain the ad.
   * @param {Object} options - Options Map.
   * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
   * @param {Object} [options.logger] - Optional logger instance.
   *                                    Must comply to the [Console interface](https://developer.mozilla.org/es/docs/Web/API/Console).
   *                                    Defaults to console.
   * @param {boolean} [options.dynamicResize] - Optional flag to tell the container to resize automatically whenever the placeholder changes its size.
   *                                            Defaults to true.
   */
  constructor (placeholder, options = {}) {
    super(placeholder, options);

    const {
      videoElement,
      logger = console,
      dynamicResize = true
    } = options;

    if (videoElement) {
      logger.warn('SecureVideoAdContainer ignores the passed video element');
    }

    this.context = null;
    this.videoElement = null;

    this.element.classList.add('mol-secure-video-ad-container');
    const iframeElement = createAdContainerIframe();

    this[readyPromiseKey] = new Promise((resolve, reject) => {
      iframeElement.addEventListener('error', reject);
      iframeElement.addEventListener('load', resolve);
    })
      .then(() => {
        const iframeDocument = getContentDocument(iframeElement);

        this[iframeElementKey] = iframeElement;
        this.context = iframeElement.contentWindow;
        this.videoElement = createAdVideoElement(iframeDocument);

        iframeDocument.body.appendChild(this.videoElement);
        this.resize();

        if (dynamicResize) {
          this.onResize(() => this.resize());
        }

        return this;
      });

    this.element.appendChild(iframeElement);
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
   * Call this method whenever you need to do a manual resize and are not sure that the change will be automatically picked.
   * or if `dynamicResize` option flag was set to false when the container was created.
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

    return super.addScript(src, {
      placeholder,
      ...options
    });
  }

  /**
   * Destroys the VideoAdContainer.
   */
  destroy () {
    super.destroy();
  }
}

