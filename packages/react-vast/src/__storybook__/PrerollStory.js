import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';

const width = 640;
const height = 360;

/* eslint-disable sort-keys */
const styles = {
  story: {
    position: 'relative'
  },
  ad: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width / 2,
    height: height / 2,
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

class PrerollStory extends React.Component {
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
    const {action, component: VideoAdComponent} = this.props;

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
        <div style={styles.ad}>
          <VideoAdComponent
            getTag={() => this.props.tag}
            height={styles.ad.height}
            onComplete={action('complete')}
            onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
            onNonRecoverableError={action('NonRecoverableError')}
            onRecoverableError={action('RecoverableError')}
            renderLoading={() => <Spinner />}
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
