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

const removeMetrichandlers = Symbol('removeMetrichandlers');
const removeIcons = Symbol('removeIcons');
const throwIfDestroyed = Symbol('throwIfDestroyed');
const throwIfNotStarted = Symbol('throwIfNotStarted');
const hidden = Symbol('hidden');

class VastAdUnit extends Emitter {
  [hidden] = {
    destroyed: false,
    onCompleteCallbacks: [],
    onErrorCallbacks: [],
    started: false
  };

  [throwIfDestroyed] () {
    if (this.isDestroyed()) {
      throw new Error('VastAdUnit has been destroyed');
    }
  }
  [throwIfNotStarted] () {
    if (!this.isStarted()) {
      throw new Error('VastAdUnit has not started');
    }
  }

  handleMetric = (event, data) => {
    switch (event) {
    case complete: {
      this[hidden].onCompleteCallbacks.forEach((callback) => callback(this));
      break;
    }
    case errorEvt: {
      this.error = data;
      this.errorCode = this.error && this.error.errorCode ? this.error.errorCode : 405;
      this[hidden].onErrorCallbacks.forEach((callback) => callback(this, this.error));
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
    this[removeMetrichandlers] = setupMetricHandlers({
      hooks: this.hooks,
      vastChain: this.vastChain,
      videoAdContainer: this.videoAdContainer
    }, this.handleMetric);
  }

  start () {
    this[throwIfDestroyed]();

    if (this.isStarted()) {
      return;
    }

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

    this[hidden].started = true;
  }

  resume () {
    this[throwIfDestroyed]();
    this[throwIfNotStarted]();

    const {videoElement} = this.videoAdContainer;

    videoElement.play();
  }

  pause () {
    this[throwIfDestroyed]();
    this[throwIfNotStarted]();

    const {videoElement} = this.videoAdContainer;

    videoElement.pause();
  }

  cancel () {
    this[throwIfDestroyed]();

    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();
  }

  onComplete (callback) {
    this[throwIfDestroyed]();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onCompleteCallbacks.push(safeCallback(callback, this.logger));
  }

  onError (callback) {
    this[throwIfDestroyed]();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onErrorCallbacks.push(safeCallback(callback, this.logger));
  }

  isDestroyed () {
    return this[hidden].destroyed;
  }

  isStarted () {
    return this[hidden].started;
  }

  destroy () {
    this.videoAdContainer.videoElement.src = '';
    this[removeMetrichandlers]();

    this.vastChain = null;
    this.videoAdContainer = null;
    this.error = null;
    this.errorCode = null;
    this.assetUri = null;
    this[removeMetrichandlers] = null;

    this[hidden].destroyed = true;

    if (this[removeIcons]) {
      this[removeIcons]();
    }
  }
}

export default VastAdUnit;
