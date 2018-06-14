/* eslint-disable filenames/match-exported, filenames/match-regex, complexity */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';
import render from '../VideoAd/render';
import defaultState from '../VideoAd/defaultState';

export class VideoAdSync extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  state = defaultState;

  componentDidMount () {
    this.init();
  }

  componentWillUnmount () {
    if (this.adsLoader) {
      this.adsLoader.destroy();
    }

    if (this.adsManager) {
      this.adsManager.destroy();
    }

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  duration;
  adContainer;
  adDisplayContainer;
  adsLoader;
  adsManager;
  progressTimer;
  adsRequest;

  ref = (div) => {
    this.adContainer = div;
  };

  actions = {
    pause: () => {
      if (this.adsManager) {
        this.adsManager.pause();
      }
    },

    play: () => {
      if (this.adsManager) {
        this.adsManager.resume();
      }
    },

    setVolume: (volume) => {
      if (this.adsManager) {
        this.adsManger.setVolume(volume);
      }
    }
  };

  createAdDisplayContainer () {
    const ima = window.google.ima;

    this.adDisplayContainer = new ima.AdDisplayContainer(this.adContainer, this.props.videoElement);
  }

  init () {
    const ima = window.google.ima;

    this.createAdDisplayContainer();
    this.adsLoader = new ima.AdsLoader(this.adDisplayContainer);

    this.adsLoader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded, false);
    this.adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false);

    // Request video ads.
    this.adsRequest = new ima.AdsRequest();
    this.adsRequest.adTagUrl = this.props.getTag();

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    this.adsRequest.linearAdSlotWidth = this.props.width;
    this.adsRequest.linearAdSlotHeight = this.props.height;
    this.adsRequest.nonLinearAdSlotWidth = this.props.width;
    this.adsRequest.nonLinearAdSlotHeight = this.props.height;

    this.adsLoader.requestAds(this.adsRequest);
  }

  onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    const ima = window.google.ima;
    const adsRenderingSettings = new ima.AdsRenderingSettings();

    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    this.adsManager = adsManagerLoadedEvent.getAdsManager(this.props.videoElement, adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);
    this.adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAdEvent);

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(ima.AdEvent.Type.LOADED, this.onAdEvent);
    this.adsManager.addEventListener(ima.AdEvent.Type.STARTED, this.onAdEvent);
    this.adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, this.onAdEvent);

    this.playAds();
  }

  onError = (error) => {
    this.setState({error});
    this.props.logger.log(error);
    this.props.onError(error);
  };

  onAdError = (adErrorEvent) => {
    // Handle the error logging.
    this.adsManager.destroy();
    this.onError(adErrorEvent.getError());
  };

  onContentResumeRequested = () => {
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    this.execEvent('onComplete');
  }

  onContentPauseRequested = () => {
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
  }

  createStateObject () {
    const duration = this.duration;
    const remainingTime = this.adsManager.getRemainingTime();
    const progress = remainingTime && remainingTime > -1 ?
      duration - remainingTime :
      0;
    const volume = this.adsManager.getVolume();
    const state = {
      duration,
      progress,
      volume
    };

    return state;
  }

  execEvent (name) {
    this.props[name](this.createStateObject(), this.actions);
  }

  onAdEvent = (adEvent) => {
    const ima = window.google.ima;
    const ad = adEvent.getAd();

    switch (adEvent.type) {
    case ima.AdEvent.Type.LOADED:
      this.props.logger.log('ad loaded');

      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (ad.isLinear()) {
        this.duration = ad.getDuration();

        if (this.duration && this.duration > -1) {
          this.execEvent('onDuration');
        }
      }
      break;
    case ima.AdEvent.Type.STARTED:
      this.props.logger.log('ad started');

      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        if (this.duration && this.duration > -1) {
          this.progressTimer = setInterval(() => {
            this.execEvent('onProgress');
          }, 250);
        }
      }
      break;
    case ima.AdEvent.Type.COMPLETE:
      this.props.logger.log('ad completed');

      if (this.progressTimer) {
        if (this.duration && this.duration > -1) {
          this.execEvent('onProgress');
        }

        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
      break;
    }
  }

  playAds () {
    const ima = window.google.ima;

    try {
      // TODO: Initialize the container. Must be done via a user action on mobile devices.
      this.adDisplayContainer.initialize();

      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(this.props.width, this.props.height, ima.ViewMode.NORMAL);

      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();

      this.setState({
        loading: false
      });

      this.execEvent('onStart');
    } catch (error) {
      this.onError(error);
    }
  }
}

VideoAdSync.prototype.render = render;
