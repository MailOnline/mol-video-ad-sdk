/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from 'mol-video-ad-tracker';
import Emitter from 'mol-tiny-emitter';
import findBestMedia from './helpers/media/findBestMedia';
import setupMetricHandlers from './helpers/metrics/setupMetricHandlers';
import setupIcons from './helpers/icons/setupIcons';
import safeCallback from './helpers/safeCallback';

const {
  complete,
  iconClick,
  iconView,
  error: errorEvt
} = linearEvents;

const onErrorCallbacks = Symbol('onErrorCallbacks');
const onCompleteCallbacks = Symbol('onCompleteCallbacks');
const removeMetrichandlers = Symbol('removeMetrichandlers');
const removeIcons = Symbol('removeIcons');

class VastAdUnit extends Emitter {
  [onErrorCallbacks] = [];
  [onCompleteCallbacks] = [];
  handleMetric = (event, data) => {
    switch (event) {
    case complete: {
      this[onCompleteCallbacks].forEach((callback) => callback(this));
      break;
    }
    case errorEvt: {
      this.error = data;
      this.errorCode = this.error && this.error.errorCode ? this.error.errorCode : 405;
      this[onErrorCallbacks].forEach((callback) => callback(this, this.error));
      break;
    }
    }

    this.emit(event, event, this, data);
  }
  error = null;
  errorCode = null;
  assetUri = null;

  constructor (vastChain, videoAdContainer, {hooks = {}, logger = console} = {}) {
    super(logger);

    this.hooks = hooks;
    this.vastChain = vastChain;
    this.videoAdContainer = videoAdContainer;
    this[removeIcons] = setupIcons(vastChain, {
      logger,
      onIconClick: (icon) => this.emit(iconClick, iconClick, this, icon),
      onIconView: (icon) => this.emit(iconView, iconView, this, icon),
      videoAdContainer
    });
  }

  run () {
    this[removeMetrichandlers] = setupMetricHandlers({
      hooks: this.hooks,
      vastChain: this.vastChain,
      videoAdContainer: this.videoAdContainer
    }, this.handleMetric);

    this.start();
  }

  start () {
    const inlineAd = this.vastChain[0].ad;
    const {videoElement, element} = this.videoAdContainer;
    const media = findBestMedia(inlineAd, videoElement, element);

    if (Boolean(media)) {
      videoElement.src = media.src;
      this.assetUri = media.src;
      videoElement.play();
    } else {
      const adUnitError = new Error('Can\'t find a suitable media to play');

      adUnitError.errorCode = 403;
      this.handleMetric(errorEvt, adUnitError);
    }
  }

  cancel () {
    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();
  }

  onComplete (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onCompleteCallbacks].push(safeCallback(callback, this.logger));
  }

  onError (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[onErrorCallbacks].push(safeCallback(callback, this.logger));
  }

  destroy () {
    this.videoAdContainer.videoElement.src = '';
    this[removeMetrichandlers]();

    this.vastChain = null;
    this.videoAdContainer = null;
    this.error = null;
    this.errorCode = null;
    this.assetUri = null;
    this[onErrorCallbacks] = null;
    this[onCompleteCallbacks] = null;
    this[removeMetrichandlers] = null;

    if (this[removeIcons]) {
      this[removeIcons]();
    }
  }
}

export default VastAdUnit;
