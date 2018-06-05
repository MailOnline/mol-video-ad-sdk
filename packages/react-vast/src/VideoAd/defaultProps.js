const noop = () => {};

const defaultProps = {
  height: 360,
  logger: console,
  onComplete: noop,
  onLinearEvent: noop,
  onNonRecoverableError: noop,
  onRecoverableError: noop,
  onStart: noop,
  renderLoading: () => null,
  tracker: undefined,
  videoElement: undefined,
  width: 640
};

export default defaultProps;
