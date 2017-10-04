/* eslint-disable class-methods-use-this */
import Emitter from 'mol-tiny-emitter';
import {getMediaFiles} from 'mol-vast-selectors';
import canPlay from './helpers/canPlay';
import sortMediaByBestFit from './helpers/sortMediaByBestFit';
import metricHandlers from './helpers/metrics';

const findBestMedia = (videoElement, mediaFiles, container) => {
  const screenRect = container.getBoundingClientRect();
  const suportedMediaFiles = mediaFiles.filter((mediaFile) => canPlay(videoElement, mediaFile));
  const sortedMediaFiles = sortMediaByBestFit(suportedMediaFiles, screenRect);

  return sortedMediaFiles[0];
};

const startMetricListeners = (videoElement, callback) => {
  const stopHandlersFns = metricHandlers.map((handler) => handler(videoElement, callback));

  return () => stopHandlersFns.forEach((disconnect) => disconnect());
};

const onErrorCallbacks = Symbol('onErrorCallbacks');
const onCompleteCallbacks = Symbol('onCompleteCallbacks');
const removeMetricListeners = Symbol('removeMetricListeners');

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
    this[removeMetricListeners] = startMetricListeners(videoElement, (event) => this.emit(event));

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
    this.videoElement.src = '';
    this[removeMetricListeners]();

    // removes the symbol from the ad container
    // removes skip control
  }
}

export default VastAdUnit;
