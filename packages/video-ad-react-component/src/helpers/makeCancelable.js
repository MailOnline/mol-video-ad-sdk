const makeCancelable = (promise) => {
  let wasCanceled = false;
  let pending = true;

  const wrappedPromise = new Promise((resolve, reject) => {
    const onSuccess = (value) => {
      if (wasCanceled) {
        const error = new Error('Promise was canceled');

        error.canceled = true;

        return reject(error);
      }

      pending = false;

      return resolve(value);
    };

    const onError = (error) => {
      if (wasCanceled) {
        error.canceled = true;
      }

      return reject(error);
    };

    promise
      // eslint-disable-next-line promise/prefer-await-to-then
      .then(onSuccess)
      .catch(onError);
  });

  return {
    cancel () {
      wasCanceled = true;
    },
    isPending () {
      return pending;
    },
    promise: wrappedPromise
  };
};

export default makeCancelable;
