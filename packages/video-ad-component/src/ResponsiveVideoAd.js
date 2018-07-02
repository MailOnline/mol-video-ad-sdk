import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  onElementResize,
  onElementVisibilityChange
} from '@mol/element-observers';
import VideoAd from './VideoAd';

class ResponsiveVideoAd extends Component {
  static defaultProps = {
    onStart: undefined
  };

  static propTypes = {
    onStart: PropTypes.func
  };

  state = {
    height: 0,
    width: 0
  };

  constructor (props) {
    super(props);

    this.placeholder = React.createRef();
  }

  componentDidMount () {
    const element = this.placeholder.current;

    onElementResize(element, () => {
      // eslint-disable-next-line react/no-set-state
      this.setState({
        height: element.clientHeight,
        width: element.clientWidth
      });
    });
  }

  handleOnStart ({adUnit, ...args}) {
    onElementVisibilityChange(this.placeholder.current, (visible) => {
      if (adUnit.isFinished()) {
        return;
      }

      if (visible) {
        adUnit.resume();
      } else {
        adUnit.pause();
      }
    });

    if (typeof this.props.onStart === 'function') {
      this.props.onStart({
        adUnit,
        ...args
      });
    }
  }

  render () {
    const videoAdProps = {
      ...this.props,
      ...this.state,
      onStart: (...args) => this.handleOnStart(...args)
    };

    const placeHolderStyles = {
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%'
    };

    return <div ref={this.placeholder} style={placeHolderStyles}>
      <VideoAd {...videoAdProps} />
    </div>;
  }
}

export default ResponsiveVideoAd;
