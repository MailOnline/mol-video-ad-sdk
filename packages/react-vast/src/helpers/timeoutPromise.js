const timeoutPromise = (promise, timeout = 5000) => new Promise((resolve, reject) => {
  let timed = false;

  const timer = setTimeout(() => {
    timed = true;
    reject(new Error('script load timeout'));
  }, timeout);

  // eslint-disable-next-line promise/prefer-await-to-then
  promise.then((result) => {
    if (timed) {
      return undefined;
    }

    clearTimeout(timer);

    resolve(result);

    return result;
  }).catch((error) => {
    if (timed) {
      return;
    }

    clearTimeout(timer);

    reject(error);
  });
});

export default timeoutPromise;
