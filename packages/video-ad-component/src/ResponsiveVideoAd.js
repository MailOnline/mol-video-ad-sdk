import React, {Component} from 'react';
import {onElementResize} from '@mol/element-observers';
import VideoAd from './VideoAd';

class ResponsiveVideoAd extends Component {
  state = {
    height: 0,
    width: 0
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

  ref = (element) => {
    this.element = element;
  };

  render () {
    const videoAdProps = {
      ...this.props,
      ...this.state
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
