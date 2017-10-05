/* eslint-disable class-methods-use-this, promise/prefer-await-to-callbacks */
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
const onProgressCallbacks = Symbol('onProgressCallbacks');
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
    this[onProgressCallbacks] = [];
  }

  run () {
    const videoElement = this.videoAdContainer.videoElement;
    const mediaFiles = getMediaFiles(this.vastAdChain[0].ad);
    const media = mediaFiles && findBestMedia(videoElement, mediaFiles, this.videoAdContainer.element);

    if (!Boolean(media)) {
      throw new Error('Can\'t find a suitable media to play');
    }

    videoElement.src = media.src;
    this.assetUri = media.src;
    this[removeMetricListeners] = startMetricListeners(videoElement, (event) => this.emit(event));

    // TODO:
    //      - contentplayhead logic
    //      - onComplete logic
    //      - onError logic
    //      - onProgress logic
    //      - add the symbol to the container
    //      - add skip control if necessary
    //      - Click tracking
    //      - Impression tracking

    videoElement.play();
  }

  cancel () {
    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();
    this.destroy();
  }

  oncomplete (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onCompleteCallbacks].push(callback);
  }

  onerror (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onErrorCallbacks].push(callback);
  }

  onprogress (offset, callback) {
    if (typeof offset !== 'string' && typeof offset !== 'number') {
      throw new TypeError('Wrong offset');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onProgressCallbacks].push({
      callback,
      offset
    });
  }

  destroy () {
    this.videoAdContainer.videoElement.src = '';
    this[removeMetricListeners]();

    this.vastAdChain = null;
    this.videoAdContainer = null;
    this.error = null;
    this.errorCode = null;
    this.assetUri = null;
    this.contentplayhead = null;
    this[onErrorCallbacks] = null;
    this[onCompleteCallbacks] = null;
    this[onProgressCallbacks] = null;
    this[removeMetricListeners] = null;
  }
}

export default VastAdUnit;
