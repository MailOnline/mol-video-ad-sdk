/* eslint-disable class-methods-use-this */
import Emitter from 'mol-tiny-emitter';
import {getMediaFiles} from 'mol-vast-selectors';
import canPlay from './helpers/canPlay';
import sortMediaByBestFit from './helpers/sortMediaByBestFit';

const findBestMedia = (videoElement, mediaFiles, container) => {
  const screenRect = container.getBoundingClientRect();
  const suportedMediaFiles = mediaFiles.filter((mediaFile) => canPlay(videoElement, mediaFile));
  const sortedMediaFiles = sortMediaByBestFit(suportedMediaFiles, screenRect);

  return sortedMediaFiles[0];
};

const onErrorCallbacks = Symbol('onErrorCallbacks');
const onCompleteCallbacks = Symbol('onCompleteCallbacks');

class VastAdUnit extends Emitter {
  constructor (vastAdChain, videoAdContainer, {logger = console} = {}) {
    super(logger);

    this.vastAdChain = vastAdChain;
    this.videoAdContainer = videoAdContainer;
    this.error = null;
    this.errorCode = null;
    this.assetUri = null;
    this.contentplayhead = null;
    this[onErrorCallbacks] = [];
    this[onCompleteCallbacks] = [];
  }

  run () {
    const videoElement = this.videoAdContainer.videoElement;
    const mediaFiles = getMediaFiles(this.vastAdChain[0].ad) || [];
    const media = findBestMedia(videoElement, mediaFiles, this.videoAdContainer.element);

    if (!Boolean(media)) {
      throw new Error('Can\'t find a suitable media to play');
    }

    videoElement.src = media.src;

    // TODO: listen to media events and emit tracking events
    // TODO: add the symbol to the container
    // TODO: add skip control if necessary
    // TODO: Click tracking

    videoElement.play();
  }

  cancel () {
    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();
    this.destroy();
  }

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  oncomplete (callback) {
    if (typeof callback === 'function') {
      this[onCompleteCallbacks].push(callback);
    }
  }

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  onerror (callback) {
    if (typeof callback === 'function') {
      this[onErrorCallbacks].push(callback);
    }
  }

  destroy () {
    // removes the ad source from the video element
    // stop listening to media events
    // removes the symbol from the ad container
  }
}

export default VastAdUnit;
