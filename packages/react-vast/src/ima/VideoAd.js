/* eslint-disable filenames/match-exported, filenames/match-regex */
import React from 'react';
import defaultProps from '../VideoAd/defaultProps';
import propTypes from '../VideoAd/propTypes';

export class VideoAd extends React.Component {
  static defaultProps = defaultProps;
  static propTypes = propTypes;

  refAdContainer = () => {};

  handleClick = () => {
    console.log('onclick');
  };

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

export default VideoAd;