/* eslint-disable filenames/match-exported, react/no-did-mount-set-state */
import {loadScript} from '@mol-fe/mol-fe-dom-helpers';
import React from 'react';
import PropTypes from 'prop-types';
import timeoutPromise from '../helpers/timeoutPromise';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';

// TODO: WHERE IS `window.IMA_SDK_URL` SET? ON PROD SITE IT IS `undefined`.
const IMA_SDK_URL = window.IMA_SDK_URL || '//imasdk.googleapis.com/js/sdkloader/ima3_debug.js';
const loadSDK = () => {
  if (typeof window === 'object' && window.google && window.google.ima) {
    return Promise.resolve();
  }

  return timeoutPromise(loadScript(IMA_SDK_URL), 5000);
};

const loadComponent = async () => {
  const {VideoAdSync} = await import('./VideoAdSync');

  return VideoAdSync;
};

const defaultRender = () => null;

class VideoAd extends React.Component {
  static propTypes = {
    ...propTypes,
    onLoadingError: PropTypes.func,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func
  };

  static defaultProps = {
    ...defaultProps,
    onLoadingError: () => {},
    renderError: defaultRender,
    renderLoading: defaultRender
  };

  state = {
    Component: null,
    error: null
  };

  async componentDidMount () {
    try {
      const [Component] = await Promise.all([
        loadComponent(),
        loadSDK()
      ]);

      this.setState({
        Component
      });
    } catch (error) {
      this.props.onLoadingError(error);
      this.setState({
        error
      });
    }
  }

  render () {
    // eslint-disable-next-line no-unused-vars
    const {renderError, renderLoading, onLoadingError, ...rest} = this.props;
    const {Component, error} = this.state;

    if (error) {
      return renderError(error, this.props);
    }

    if (!Component) {
      return renderLoading(this.props);
    }

    return <Component {...rest} />;
  }
}

export default VideoAd;
