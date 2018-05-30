import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  getTag: PropTypes.func.isRequired,
  height: PropTypes.number,
  logger: PropTypes.shape({
    error: PropTypes.func,
    log: PropTypes.func
  }),
  onComplete: PropTypes.func,
  onLinearEvent: PropTypes.func,
  onNonRecoverableError: PropTypes.func,
  onRecoverableError: PropTypes.func,
  onStart: PropTypes.func,
  tracker: PropTypes.func,
  videoElement: PropTypes.node,
  width: PropTypes.number
};

export default propTypes;
