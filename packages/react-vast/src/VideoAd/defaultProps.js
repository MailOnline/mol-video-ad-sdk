const noop = () => {};

const defaultProps = {
  height: 360,
  logger: console,
  onComplete: noop,
  onError: noop,
  onLinearEvent: noop,
  onStart: noop,
  renderError: (error) => error.message,
  renderLoading: () => null,
  tracker: undefined,
  videoElement: undefined,
  width: 640
};

export default defaultProps;
