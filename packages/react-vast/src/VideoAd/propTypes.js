import PropTypes from 'prop-types';

const propTypes = {

  // TODO: Why is this a function?
  getTag: PropTypes.func.isRequired,
  height: PropTypes.number,
  logger: PropTypes.shape({
    error: PropTypes.func,
    log: PropTypes.func
  }),
  onComplete: PropTypes.func,
  onError: PropTypes.func,
  onLinearEvent: PropTypes.func,
  onStart: PropTypes.func,
  renderError: PropTypes.func,
  renderLoading: PropTypes.func,
  tracker: PropTypes.func,
  videoElement: PropTypes.node,
  width: PropTypes.number
};

export default propTypes;
