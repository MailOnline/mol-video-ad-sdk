/* eslint-disable promise/prefer-await-to-callbacks */
import Emitter from 'mol-tiny-emitter';
import {
  getMediaFiles
} from 'mol-vast-selectors';
import canPlay from './helpers/canPlay';
import sortMediaByBestFit from './helpers/sortMediaByBestFit';
import metricHandlers from './helpers/metrics';
import {
  complete,
  progress,
  error
} from './helpers/metrics/linearTrackingEvents';

const findBestMedia = (videoElement, mediaFiles, container) => {
  const screenRect = container.getBoundingClientRect();
  const suportedMediaFiles = mediaFiles.filter((mediaFile) => canPlay(videoElement, mediaFile));
  const sortedMediaFiles = sortMediaByBestFit(suportedMediaFiles, screenRect);

  return sortedMediaFiles[0];
};

const startMetricListeners = (videoAdContainer, callback) => {
  const stopHandlersFns = metricHandlers.map((handler) => handler(videoAdContainer, callback));

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
    const videoAdContainer = this.videoAdContainer;
    const {videoElement, element} = videoAdContainer;
    const inlineAd = this.vastAdChain[0].ad;
    const mediaFiles = getMediaFiles(inlineAd);
    const media = mediaFiles && findBestMedia(videoElement, mediaFiles, element);

    if (!Boolean(media)) {
      throw new Error('Can\'t find a suitable media to play');
    }

    videoElement.src = media.src;
    this.assetUri = media.src;

    this[removeMetricListeners] = startMetricListeners(videoAdContainer, (event, data) => {
      this.emit(event, event);

      switch (event) {
      case progress: {
        const {contentplayhead} = data;

        this.contentplayhead = contentplayhead;
        this[onErrorCallbacks].forEach((callback) => callback(data));
        break;
      }
      case complete: {
        this[onCompleteCallbacks].forEach((callback) => callback());
        break;
      }
      case error: {
        this[onErrorCallbacks].forEach((callback) => callback());
        break;
      }
      }
    });

    // TODO:
    //      - Click tracking
    //      - add skip control if necessary
    //      - add the ICON to the container

    videoElement.play();
  }

  cancel () {
    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();
  }

  onComplete (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onCompleteCallbacks].push(callback);
  }

  onError (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onErrorCallbacks].push(callback);
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
    this[removeMetricListeners] = null;
  }
}

export default VastAdUnit;
