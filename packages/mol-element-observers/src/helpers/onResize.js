/* eslint-disable promise/prefer-await-to-callbacks */
import debounce from 'lodash/debounce';

let resizeHandlers = [];

const callHandlers = () => resizeHandlers.forEach((handler) => handler());
const validate = (callback) => {
  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function');
  }
};

export default (callback, {threshold = 0} = {}) => {
  validate(callback);
  const resizeHandler = threshold > 0 ? debounce(callback, threshold) : callback;

  resizeHandlers.push(resizeHandler);

  if (resizeHandlers.length === 1) {
    window.addEventListener('resize', callHandlers);
    window.addEventListener('orientationchange', callHandlers);
  }

  return () => {
    resizeHandlers = resizeHandlers.filter((handler) => handler !== resizeHandler);

    if (resizeHandlers.length === 0) {
      window.removeEventListener('resize', callHandlers);
      window.removeEventListener('orientationchange', callHandlers);
    }
  };
};
