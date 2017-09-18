import loadScript from './helpers/loadScript';

const createAdContainer = (placeHolder) => {
  const adContainer = document.createElement('DIV');

  adContainer.classList.add('mol-video-ad-container');
  adContainer.style.width = '100%';
  adContainer.style.height = '100%';
  placeHolder.appendChild(adContainer);

  return adContainer;
};

const createAdVideoElement = (placeHolder) => {
  const video = document.createElement('VIDEO');

  video.style.width = '100%';
  video.style.height = '100%';

  placeHolder.appendChild(video);

  return video;
};

export default class VideoAdContainer {
  constructor (placeHolder, {videoElement = null} = {}) {
    if (!(placeHolder instanceof Element)) {
      throw new TypeError('placeHolder is not an Element');
    }

    this.element = createAdContainer(placeHolder);

    if (videoElement) {
      this.videoElement = videoElement;
    } else {
      this.videoElement = createAdVideoElement(this.element);
    }
  }

  addScript (src, options = {}) {
    if (!Boolean(this.element)) {
      throw new Error('videoAdContainer has been destroyed');
    }

    return loadScript(src, {
      container: this.element,
      defer: true,
      ...options
    });
  }

  destroy () {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
    this.videoElement = null;
  }
}

