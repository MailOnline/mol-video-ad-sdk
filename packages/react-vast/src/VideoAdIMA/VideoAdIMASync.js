/* eslint-disable filenames/match-exported, filenames/match-regex */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';
import getAdsLoader from './getAdsLoader';

export class VideoAdIMASync extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  componentDidMount () {
    const ima = window.google.ima;

    // TODO: GET VIDEO ELEMENT. DO WE NEED AN ACTUAL VIDEO ELEMENT?
    const videoElement = undefined;

    this.adDisplayContainer = new window.google.ima.AdDisplayContainer(this.el, videoElement);

    // NOTE: Must be done as the result of a user action on mobile
    this.adDisplayContainer.initialize();

    this.adsLoader = getAdsLoader(this.el);

    // Add event listeners
    this.adsLoader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded, false);
    this.adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false);

    // Request video ads.
    this.adsRequest = new ima.AdsRequest();

    this.adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
      'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // TODO: USE VIDEO PLAYER DIMENSIONS?
    this.adsRequest.linearAdSlotWidth = 300;
    this.adsRequest.linearAdSlotHeight = 300;
    this.adsRequest.nonLinearAdSlotWidth = 300;
    this.adsRequest.nonLinearAdSlotHeight = 300;
  }

  el = null;
  adsManager = null;
  adsLoader = null;
  adsRequest = null;

  ref = (el) => {
    this.el = el;
  };

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

  onAdsManagerLoaded = () => {
    console.log('onAdsManagerLoaded()');
  };

  // An event listener to tell the SDK that our content video
  // is completed so the SDK can play any post-roll ads.
  contentEndedListener = () => {
    if (this.adsLoader) {
      this.adsLoader.contentComplete();
    }
  };

  // In the example it is triggered by a play button click.
  requestAds () {
    this.adsLoader.requestAds(this.adsRequest);
  }

  render () {
    console.log('render()');
    return (
      <div
        ref={this.ref}
        style={{
          border: '1px solid red',
          height: 300,
          width: 300
        }}
      >
        VideoAdIMASync
      </div>
    );
  }
}
