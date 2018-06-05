/* eslint-disable filenames/match-exported, filenames/match-regex */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';
import getAdsLoader from './getAdsLoader';

export class VideoAdIMASync extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  componentDidMount () {
    this.mounted = true;

    this.initIMA();
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  mounted = false;
  el = null;
  videoEl = null;
  adDisplayContainer = null;
  adsLoader = null;
  adsRequest = null;
  adsManager = null;

  ref = (el) => {
    this.el = el;
  };

  videoRef = (videoEl) => {
    this.videoEl = videoEl;
  };

  // TODO: GET VIDEO ELEMENT. DO WE NEED AN ACTUAL VIDEO ELEMENT?
  // eslint-disable-next-line class-methods-use-this
  getVideoElement () {
    return this.videoEl;
  }

  initIMA () {
    const ima = window.google.ima;

    this.adDisplayContainer = new ima.AdDisplayContainer(this.el, this.getVideoElement());

    // NOTE: Must be done as the result of a user action on mobile
    this.adDisplayContainer.initialize();
    this.adsLoader = getAdsLoader(this.el);

    // Add event listeners
    this.adsLoader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded, false);
    this.adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false);

    // Request video ads.
    this.adsRequest = new ima.AdsRequest();

    this.adsRequest.adTagUrl = this.props.getTag();

    // TODO: USE VIDEO PLAYER DIMENSIONS?
    this.adsRequest.linearAdSlotWidth = this.props.width;
    this.adsRequest.linearAdSlotHeight = this.props.height;
    this.adsRequest.nonLinearAdSlotWidth = this.props.width;
    this.adsRequest.nonLinearAdSlotHeight = this.props.height;

    this.requestAds();
  }

  onIMAError = (adErrorEvent) => {
    const error = adErrorEvent.getError();

    console.log('onIMAERROR', error);
    if (this.adsManager) {
      this.adsManager.destroy();
    }
  };

  onAdError = () => {
    console.log('onAdError');
  };

  onAdsManagerLoaded = (event) => {
    console.log('onAdsManagerLoaded');
    const ima = window.google.ima;

    this.adsManager = event.getAdsManager(this.getVideoElement());

    this.adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
    this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);

    try {
      this.adsManager.init(this.props.width, this.props.height, ima.ViewMode.NORMAL);
      this.adsManager.start();
    } catch (error) {
      // TODO: proceed to playing video.
      // An error may be thrown if there was a problem with the VAST response.
      // Play content here, because we won't be getting an ad.
      // videoContent.play();
    }
  };

  onContentPauseRequested = () => {
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking, etc.)
    // videoContent.removeEventListener('ended', contentEndedListener);
    // videoContent.pause();
    console.log('onContentPauseRequested()');
  }

  onContentResumeRequested = () => {
    // This function is where you should ensure that your UI is ready
    // to play content.
    // videoContent.addEventListener('ended', contentEndedListener);
    // videoContent.play();
    console.log('onContentResumeRequested()');
  }

  // An event listener to tell the SDK that our content video
  // is completed so the SDK can play any post-roll ads.
  contentEndedListener = () => {
    if (this.adsLoader && this.mounted) {
      this.adsLoader.contentComplete();
    }
  };

  // In the example it is triggered by a play button click.
  requestAds () {
    try {
      this.adsLoader.requestAds(this.adsRequest);
    } catch (error) {
      console.log('EEEE', error);
    }
  }

  render () {
    return (
      <div
        ref={this.ref}
        style={{
          border: '1px solid red',
          height: 300,
          width: 300
        }}
      >
        <video
          autoPlay={true}
          controls={false}
          ref={this.videoRef}
          src='http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
          style={{
            height: 300,
            width: 300
          }}
        />
      </div>
    );
  }
}
