/* eslint-disable promise/prefer-await-to-callbacks */
import {linearEvents} from '../tracker';
import Emitter from './helpers/Emitter';
import findBestMedia from './helpers/media/findBestMedia';
import once from './helpers/dom/once';
import setupMetricHandlers from './helpers/metrics/setupMetricHandlers';
import retrieveIcons from './helpers/icons/retrieveIcons';
import addIcons from './helpers/icons/addIcons';
import safeCallback from './helpers/safeCallback';
import updateMedia from './helpers/media/updateMedia';

const {
  complete,
  iconClick,
  iconView,
  error: errorEvt,
  skip
} = linearEvents;

const hidden = Symbol('hidden');

class VastAdUnit extends Emitter {
  [hidden] = {
    destroyed: false,
    finish: () => {
      this[hidden].onFinishCallbacks.forEach((callback) => callback());
      this[hidden].finished = true;
    },
    finished: false,
    handleMetric: (event, data) => {
      switch (event) {
      case complete: {
        this[hidden].finish();
        break;
      }
      case errorEvt: {
        this.error = data;
        this.errorCode = this.error && this.error.errorCode ? this.error.errorCode : 405;
        this[hidden].onErrorCallbacks.forEach((callback) => callback(this.error));
        this[hidden].finish();
        break;
      }
      case skip: {
        this.cancel();
        break;
      }
      }

      this.emit(event, event, this, data);
    },
    onErrorCallbacks: [],
    onFinishCallbacks: [],
    started: false,
    throwIfFinished: () => {
      if (this.isFinished()) {
        throw new Error('VastAdUnit is finished');
      }
    },
    throwIfNotStarted: () => {
      if (!this.isStarted()) {
        throw new Error('VastAdUnit has not started');
      }
    }
  };

  error = null;
  errorCode = null;
  assetUri = null;

  constructor (vastChain, videoAdContainer, {hooks = {}, logger = console} = {}) {
    super(logger);

    const {
      handleMetric,
      onFinishCallbacks
    } = this[hidden];

    this.hooks = hooks;
    this.vastChain = vastChain;
    this.videoAdContainer = videoAdContainer;

    this.icons = retrieveIcons(vastChain);

    if (this.icons) {
      const {
        drawIcons,
        hasPendingIconRedraws,
        removeIcons
      } = addIcons(this.icons, {
        logger,
        onIconClick: (icon) => this.emit(iconClick, iconClick, this, icon),
        onIconView: (icon) => this.emit(iconView, iconView, this, icon),
        videoAdContainer
      });

      this.drawIcons = drawIcons;
      this.removeIcons = removeIcons;
      this.hasPendingIconRedraws = hasPendingIconRedraws;

      onFinishCallbacks.push(removeIcons);
    }

    const removeMetrichandlers = setupMetricHandlers({
      hooks: this.hooks,
      vastChain: this.vastChain,
      videoAdContainer: this.videoAdContainer
    }, handleMetric);

    onFinishCallbacks.push(removeMetrichandlers);
  }

  async start () {
    this[hidden].throwIfFinished();

    if (this.isStarted()) {
      return;
    }

    const inlineAd = this.vastChain[0].ad;
    const {videoElement, element} = this.videoAdContainer;
    const media = findBestMedia(inlineAd, videoElement, element);

    if (Boolean(media)) {
      if (this.icons) {
        const drawIcons = async () => {
          if (this.isFinished()) {
            return;
          }

          await this.drawIcons();

          if (this.hasPendingIconRedraws() && !this.isFinished()) {
            once(videoElement, 'timeupdate', drawIcons);
          }
        };

        await drawIcons();
      }

      videoElement.src = media.src;
      this.assetUri = media.src;
      videoElement.play();
    } else {
      const adUnitError = new Error('Can\'t find a suitable media to play');

      adUnitError.errorCode = 403;
      this[hidden].handleMetric(errorEvt, adUnitError);
    }

    this[hidden].started = true;
  }

  resume () {
    this[hidden].throwIfFinished();
    this[hidden].throwIfNotStarted();

    const {videoElement} = this.videoAdContainer;

    videoElement.play();
  }

  pause () {
    this[hidden].throwIfFinished();
    this[hidden].throwIfNotStarted();

    const {videoElement} = this.videoAdContainer;

    videoElement.pause();
  }

  setVolume (newVolume) {
    this[hidden].throwIfFinished();

    const {videoElement} = this.videoAdContainer;

    videoElement.volume = newVolume;
  }

  getVolume () {
    this[hidden].throwIfFinished();

    const {videoElement} = this.videoAdContainer;

    return videoElement.volume;
  }

  cancel () {
    this[hidden].throwIfFinished();

    const videoElement = this.videoAdContainer.videoElement;

    videoElement.pause();

    this[hidden].finish();
  }

  onFinish (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onFinishCallbacks.push(safeCallback(callback, this.logger));
  }

  onError (callback) {
    this[hidden].throwIfFinished();

    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function');
    }

    this[hidden].onErrorCallbacks.push(safeCallback(callback, this.logger));
  }

  isFinished () {
    return this[hidden].finished;
  }

  isStarted () {
    return this[hidden].started;
  }

  async resize () {
    this[hidden].throwIfFinished();

    if (this.icons) {
      await this.removeIcons();
      await this.drawIcons();
    }

    if (this.isStarted()) {
      const inlineAd = this.vastChain[0].ad;
      const {videoElement, element} = this.videoAdContainer;
      const media = findBestMedia(inlineAd, videoElement, element);

      if (Boolean(media) && videoElement.src !== media.src) {
        updateMedia(videoElement, media);
      }
    }
  }
}

export default VastAdUnit;
