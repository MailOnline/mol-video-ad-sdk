const noop = () => {};

const defaultProps = {
  height: '100%',
  logger: console,
  onComplete: noop,
  onError: noop,
  onLinearEvent: noop,
  onStart: noop,
  renderError: (error) => 'Error: ' + error.message,
  renderLoading: () => null,
  tracker: undefined,
  videoElement: undefined,
  width: '100%'
};

export default defaultProps;
