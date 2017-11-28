/* eslint-disable filenames/match-exported, react/sort-comp */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import loadVastChain from './helpers/loadVastChain';
import rejectTimeout from './helpers/rejectTimeout';
import startVideoAd from './helpers/startVideoAd';

const noop = () => {};

class MolVideoAd extends Component {
  static defaultProps = {
    children: undefined,
    logger: console,
    onComplete: noop,
    onLinearEvent: noop,
    onNonRecoverableError: noop,
    onRecoverableError: noop,
    timeout: 5000,
    tracker: undefined
  };

  propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    getTag: PropTypes.func.isRequired,
    logger: PropTypes.shape({
      error: PropTypes.func,
      log: PropTypes.func
    }),
    onComplete: PropTypes.func,
    onLinearEvent: PropTypes.func,
    onNonRecoverableError: PropTypes.func,
    onRecoverableError: PropTypes.func,
    timeout: PropTypes.number.isRequired,
    tracker: PropTypes.func
  };

  ref = (element) => {
    this.element = element;
  };

  constructor (props) {
    super();

    this.props = props;
    this.state = {
      ready: false
    };
  }

  componentDidMount () {
    this.adUnitPromise = this.playAd();

    // eslint-disable-next-line promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    this.adUnitPromise.then(() => {
      // eslint-disable-next-line react/no-set-state
      this.setState({
        ready: true
      });
    });
  }

  async componentWillUnmount () {
    const adUnit = await this.adUnitPromise;

    if (!adUnit.isFinished()) {
      adUnit.cancel();
    }
  }

  async playAd () {
    const {
      getTag,
      logger,
      onComplete,
      onLinearEvent,
      onNonRecoverableError,
      onRecoverableError: onError,
      timeout: timeoutMs,
      tracker
    } = this.props;

    const options = {
      logger,
      onComplete,
      onError,
      onLinearEvent,
      tracker
    };

    try {
      const timeout = rejectTimeout(timeoutMs, {msg: 'Video Ad timeout reached!'});
      const fetchVastChain = async () => loadVastChain(await Promise.resolve(getTag()));

      this.adUnit = await startVideoAd(fetchVastChain, this.element, options, timeout);
    } catch (error) {
      logger.error('VideoAd Non recoberable error', error);
      onNonRecoverableError(error);
    }
  }

  render () {
    const {
      children
    } = this.props;

    return <div ref={this.ref}>
      {!this.state.ready && children}
    </div>;
  }
}

export default MolVideoAd;