/* eslint-disable filenames/match-exported, react/no-did-mount-set-state */
import {loadScript} from '@mol-fe/mol-fe-dom-helpers';
import React from 'react';
import timeoutPromise from '../helpers/timeoutPromise';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';

const IMA_SDK_URL = window.IMA_SDK_URL || '//imasdk.googleapis.com/js/sdkloader/ima3_debug.js';
const loadSDK = () => timeoutPromise(loadScript(IMA_SDK_URL), 5000);

const loadComponent = async () => {
  const {VideoAdIMASync} = await import('./VideoAdIMASync');

  return VideoAdIMASync;
};

class VideoAdIMA extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  state = {
    Component: null,
    error: null
  };

  async componentDidMount () {
    try {
      const [, Component] = await Promise.all([
        loadSDK(),
        loadComponent()
      ]);

      this.setState({
        Component
      });
    } catch (error) {
      this.setState({
        error
      });
    }
  }

  render () {
    const {renderError, renderLoading, ...rest} = this.props;
    const {Component, error} = this.state;

    if (error) {
      return null;
    }

    if (!Component) {
      return null;
    }

    return <Component {...rest} />;
  }
}

export default VideoAdIMA;
