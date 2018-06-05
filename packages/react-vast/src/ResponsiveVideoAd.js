import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  onElementResize,
  onElementVisibilityChange
} from '@mol/element-observers';
import VideoAd from './VideoAd';
import propTypes from './VideoAd/propTypes';
import defaultProps from './VideoAd/defaultProps';

class ResponsiveVideoAd extends Component {
  static defaultProps = {
    ...defaultProps,
    onStart: undefined
  };

  static propTypes = {
    ...propTypes,
    onStart: PropTypes.func
  };

  state = {
    height: 0,
    width: 0
  };

  ref = (element) => {
    this.element = element;
  };

  componentDidMount () {
    onElementResize(this.element, () => {
      // eslint-disable-next-line react/no-set-state
      this.setState({
        height: this.element.clientHeight,
        width: this.element.clientWidth
      });
    });
  }

  handleOnStart (adUnit, ...args) {
    onElementVisibilityChange(this.element, (visible) => {
      if (visible) {
        adUnit.resume();
      } else {
        adUnit.pause();
      }
    });

    if (typeof this.props.onStart === 'function') {
      this.props.onStart(adUnit, ...args);
    }
  }

  render () {
    const videoAdProps = {
      ...this.props,
      ...this.state,
      onStart: (...args) => this.handleOnStart(...args)
    };

    const containerStyles = {
      height: '100%',
      width: '100%'
    };

    return <div ref={this.ref} style={containerStyles}>
      <VideoAd {...videoAdProps} />
    </div>;
  }
}

export default ResponsiveVideoAd;
