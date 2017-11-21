const safeCallback = (callback, logger) => (...args) => {
  try {
    // eslint-disable-next-line callback-return, promise/prefer-await-to-callbacks
    callback(...args);
  } catch (error) {
    logger.error(error);
  }
};

export default safeCallback;
