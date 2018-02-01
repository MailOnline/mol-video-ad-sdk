/* eslint-disable filenames/match-exported, react/sort-comp */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import loadVastChain from './helpers/loadVastChain';
import startVideoAd from './helpers/startVideoAd';
import makeCancelable from './helpers/makeCancelable';

const noop = () => {};

class MolVideoAd extends Component {
  static defaultProps = {
    children: undefined,
    logger: console,
    onComplete: noop,
    onLinearEvent: noop,
    onNonRecoverableError: noop,
    onRecoverableError: noop,
    tracker: undefined
  };

  static propTypes = {
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
    this.stateUpdate = makeCancelable(this.adUnitPromise);

    // eslint-disable-next-line promise/always-return, promise/catch-or-return, promise/prefer-await-to-then
    this.stateUpdate.promise.then(() => {
      // eslint-disable-next-line react/no-set-state
      this.setState({
        ready: true
      });
    });
  }

  async componentWillUnmount () {
    if (this.stateUpdate.isPending()) {
      this.stateUpdate.cancel();
    }

    const adUnit = await this.adUnitPromise.promise;

    if (adUnit && !adUnit.isFinished()) {
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
      const fetchVastChain = async () => loadVastChain(await Promise.resolve(getTag()));

      this.adUnit = await startVideoAd(fetchVastChain, this.element, options);
    } catch (error) {
      logger.error('VideoAd Non recoberable error', error);
      onNonRecoverableError(error);

      throw error;
    }
  }

  render () {
    const {
      children
    } = this.props;

    const style = {
      height: '100%',
      width: '100%'
    };

    return <div style={style}>
      {!this.state.ready && children}
      <div ref={this.ref} />
    </div>;
  }
}

export default MolVideoAd;
