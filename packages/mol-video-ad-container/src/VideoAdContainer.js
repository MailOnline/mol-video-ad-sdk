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

export default class VideoAdContainer {
  constructor (placeholder, {videoElement = null} = {}) {
    if (!(placeholder instanceof Element)) {
      throw new TypeError('placeholder is not an Element');
    }

    this.context = window;
    this.element = createAdContainer();
    this.videoElement = isVideoElement(videoElement) ? videoElement : createAdVideoElement();

    placeholder.appendChild(this.element);
    this.element.appendChild(this.videoElement);
  }

  ready () {
    return Promise.resolve(this);
  }

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

  destroy () {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
    this.context = null;
    this.videoElement = null;
  }

  isDestroyed () {
    return !Boolean(this.element);
  }

  resize () {
    if (this.isDestroyed()) {
      throw new Error('VideoAdContainer has been destroyed');
    }

    // Video ad containers resizes automatically the size of the placeholder
  }
}

