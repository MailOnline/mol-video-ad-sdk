/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';

const width = 640;
const height = 360;
const sizes = [0.5, 0.75, 1];

/* eslint-disable sort-keys */
const styles = {
  story: {
    position: 'relative'
  },
  ad: {
    position: 'absolute',
    top: 0,
    left: 0,
    outline: '2px solid red',
    overflow: 'hidden'
  },
  videoElement: {
    width,
    height,
    overflow: 'hidden'
  }
};
/* eslint-enable sort-keys */

class PrerollResizeStory extends React.Component {
  static propTypes = {
    action: PropTypes.func,
    component: PropTypes.func.isRequired,
    tag: PropTypes.string
  };

  static defaultProps = {
    // eslint-disable-next-line no-console
    action: (name) => (event) => console.log(name, event),
    tag:
      'https://pubads.g.doubleclick.net/gampad/ads?' +
      'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
      'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator='
  };

  state = {
    counter: 0,
    showAd: false
  };

  componentDidMount () {
    this.setState({
      showAd: true
    });

    this.interval = setInterval(() => {
      this.setState({
        counter: this.state.counter + 1
      });
    }, 1000);
  }

  componentWillUnmount () {
    clearInterval(this.interval);
  }

  el = null;
  interval = null;

  ref = (el) => {
    this.el = el;
  };

  render () {
    const {action, component: VideoAdComponent} = this.props;
    const factor = sizes[this.state.counter % sizes.length];
    const adWidth = width * factor;
    const adHeight = height * factor;

    return (
      <div style={styles.story}>
        <video
          autoPlay={true}
          controls={false}
          muted={true}
          ref={this.ref}
          src='http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
          style={styles.videoElement}
        />
        <div
          style={{
            ...styles.ad,
            height: adHeight,
            width: adWidth
          }}
        >
          <VideoAdComponent
            getTag={() => this.props.tag}
            height={adHeight}
            onComplete={(state, actions) => console.log('COMPLETE', state, actions)}
            onDuration={(state, actions) => console.log('DURATION', state, actions)}
            onError={(error) => console.log('ERROR', error)}
            onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
            onProgress={(state, actions) => console.log('PROGRESS', state, actions)}
            onStart={(state, actions) => console.log('START', state, actions)}
            renderLoading={() => <Spinner />}
            tracker={() => {}}
            videoElement={this.el}
            width={adWidth}
          />
        </div>
      </div>
    );
  }
}

export default PrerollResizeStory;
