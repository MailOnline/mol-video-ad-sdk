/* eslint-disable filenames/match-exported, filenames/match-regex */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';
import render from '../VideoAd/render';

export class VideoAdSync extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  state = {
    complete: false,
    error: null,
    loading: true
  };

  componentDidMount () {
    this.init();
  }

  adContainer;
  adDisplayContainer;
  adsLoader;
  adsManager;
  intervalTimer;
  adsRequest;

  ref = (div) => {
    this.adContainer = div;
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

    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    // var contentEndedListener = function() {adsLoader.contentComplete();};

    // videoContent.onended = contentEndedListener;

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
    this.props.onComplete();
  }

  onContentPauseRequested = () => {
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
  }

  onAdEvent = (adEvent) => {
    const ima = window.google.ima;
    const ad = adEvent.getAd();

    switch (adEvent.type) {
    case ima.AdEvent.Type.LOADED:
      this.props.logger('ad loaded');

      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        // videoContent.play();
      }
      break;
    case ima.AdEvent.Type.STARTED:
      this.props.logger('ad started');

      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        this.intervalTimer = setInterval(() => {
          // const remainingTime = this.adsManager.getRemainingTime();
        }, 300);
      }
      break;
    case ima.AdEvent.Type.COMPLETE:
      this.props.logger('ad completed');

      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(this.intervalTimer);
      }
      break;
    }
  }

  playAds () {
    const ima = window.google.ima;

    // TODO: Initialize the container. Must be done via a user action on mobile devices.
    // this.props.videoElement.load();
    this.adDisplayContainer.initialize();

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(this.props.width, this.props.height, ima.ViewMode.NORMAL);

      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();

      this.setState({
        loading: false
      });

      this.props.onStart();
    } catch (error) {
      this.onError(error);
    }
  }
}

VideoAdSync.prototype.render = render;
