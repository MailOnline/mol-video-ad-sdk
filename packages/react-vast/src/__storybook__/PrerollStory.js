import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable sort-keys */
const styles = {
  story: {
    position: 'relative'
  },
  ad: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    outline: '2px solid red',
    overflow: 'hidden'
  },
  videoElement: {
    height: 360,
    overflow: 'hidden',
    width: 640
  }
};
/* eslint-enable sort-keys */

class PrerollStory extends React.Component {
  static propTypes = {
    component: PropTypes.func.isRequired
  };

  state = {
    showAd: false
  };

  componentDidMount () {
    this.setState({
      showAd: true
    });
  }

  el = null;

  ref = (el) => {
    this.el = el;
  };

  render () {
    const VideoAdComponent = this.props.component;
    // eslint-disable-next-line no-console
    const action = (name) => (event) => console.log(name, event);

    return (
      <div style={styles.story}>
        <video
          autoPlay={true}
          controls={false}
          ref={this.ref}
          src='http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
          style={styles.videoElement}
        />
        <div style={styles.ad}>
          <VideoAdComponent
            getTag={() =>
              'https://pubads.g.doubleclick.net/gampad/ads?' +
              'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
              'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
              'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator='
            }
            height={styles.ad.height}
            onComplete={action('complete')}
            onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
            onNonRecoverableError={action('NonRecoverableError')}
            onRecoverableError={action('RecoverableError')}
            tracker={() => {}}
            videoElement={this.el}
            width={styles.ad.width}
          />
        </div>
      </div>
    );
  }
}

export default PrerollStory;
