/* eslint-disable filenames/match-exported, filenames/match-regex */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';

export class VideoAdSync extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  componentDidMount () {
    this.init();
  }

  videoContent;
  adContainer;
  adDisplayContainer;
  adsLoader;
  adsManager;
  intervalTimer;
  adsRequest;

  refAdContainer = (div) => {
    this.adContainer = div;
  };

  refContentElement = (video) => {
    this.videoContent = video;
  };

  handleClick = () => {
    this.playAds();
  };

  createAdDisplayContainer () {
    this.adDisplayContainer = new window.google.ima.AdDisplayContainer(this.adContainer, this.videoContent);
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
    this.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    this.adsRequest.linearAdSlotWidth = 640;
    this.adsRequest.linearAdSlotHeight = 400;

    this.adsRequest.nonLinearAdSlotWidth = 640;
    this.adsRequest.nonLinearAdSlotHeight = 150;

    this.adsLoader.requestAds(this.adsRequest);
  }

  onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    const ima = window.google.ima;
    const adsRenderingSettings = new ima.AdsRenderingSettings();

    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    this.adsManager = adsManagerLoadedEvent.getAdsManager(this.videoContent, adsRenderingSettings);

    // Add listeners to the required events.
    this.adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);
    this.adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAdEvent);

    // Listen to any additional events, if necessary.
    this.adsManager.addEventListener(ima.AdEvent.Type.LOADED, this.onAdEvent);
    this.adsManager.addEventListener(ima.AdEvent.Type.STARTED, this.onAdEvent);
    this.adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, this.onAdEvent);
  }

  onAdError = (adErrorEvent) => {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    this.adsManager.destroy();
  };

  onContentResumeRequested = () => {
    // videoContent.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();
  }

  onContentPauseRequested = () => {
    // videoContent.pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    // setupUIForAds();
  }

  onAdEvent = (adEvent) => {
    const ima = window.google.ima;
    const ad = adEvent.getAd();

    switch (adEvent.type) {
    case ima.AdEvent.Type.LOADED:
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        // videoContent.play();
      }
      break;
    case ima.AdEvent.Type.STARTED:
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
    this.videoContent.load();
    this.adDisplayContainer.initialize();

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      this.adsManager.init(640, 360, ima.ViewMode.NORMAL);

      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      this.adsManager.start();
    } catch (error) {
      // An error may be thrown if there was a problem with the VAST response.
      this.videoContent.play();
    }
  }

  render () {
    return (
      <div>
        <div style={{
          height: 360,
          position: 'relative',
          width: 640
        }}>
          <div
            id='content'
            style={{
              height: 360,
              left: 0,
              position: 'absolute',
              top: 0,
              width: 640
            }}
          >
            <video
              ref={this.refContentElement}
              style={{
                height: 360,
                overflow: 'hidden',
                width: 640
              }}
            >
              <source src='http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4' />
              <source src='http://rmcdn.2mdn.net/Demo/vast_inspector/android.webm' />
            </video>
          </div>
          <div
            ref={this.refAdContainer}
            style={{
              height: 360,
              left: 0,
              position: 'absolute',
              top: 0,
              width: 640
            }}
          />
        </div>
        <button onClick={this.handleClick}>Play</button>
      </div>
    );
  }
}
