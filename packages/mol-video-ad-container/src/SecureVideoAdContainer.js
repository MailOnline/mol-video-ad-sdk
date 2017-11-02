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

export default class SecureVideoAdContainer extends VideoAdContainer {
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

  ready () {
    return this[readyPromiseKey];
  }

  resize () {
    if (this.isDestroyed()) {
      throw new Error('SecureVideoAdContainer has been destroyed');
    }

    const iframeElement = this[iframeElementKey];
    const {clientHeight, clientWidth} = this.element;

    iframeElement.width = `${clientWidth}px`;
    iframeElement.height = `${clientHeight}px`;
  }

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

  destroy () {
    super.destroy();

    this[iframeElementKey] = null;
  }
}

