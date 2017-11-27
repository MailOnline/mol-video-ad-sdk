const rejectTimeout = (timeoutMs, msg) => {
  let timeoutId;
  const timeout = {
    clearTimeout: () => clearTimeout(timeoutId),
    done: false,
    promise: new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        timeout.done = true;
        reject(new Error(msg || 'Timeout reached'));
      }, timeoutMs);
    })
  };

  return timeout;
};

export default rejectTimeout;
