const noop = () => {};

const defaultProps = {
  children: undefined,
  height: undefined,
  logger: console,
  onComplete: noop,
  onLinearEvent: noop,
  onNonRecoverableError: noop,
  onRecoverableError: noop,
  onStart: noop,
  tracker: undefined,
  videoElement: undefined,
  width: undefined
};

export default defaultProps;
