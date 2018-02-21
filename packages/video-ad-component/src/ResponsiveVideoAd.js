import React, {Component} from 'react';
import {onElementResize} from '@mol/element-observers';
import VideoAd from './VideoAd';

// TODO: test this component
class ResponsiveVideoAd extends Component {
  constructor (props, context) {
    super(props, context);

    this.state = {
      height: 0,
      width: 0
    };
  }

  componentDidMount () {
    this.removeResizeListener = onElementResize(this.element, () => {
      // eslint-disable-next-line react/no-set-state
      this.setState({
        height: this.element.clientHeight,
        width: this.element.clientWidth
      });
    });
  }

  componentWillUnmount () {
    this.removeResizeListener();
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
