/* eslint-disable promise/prefer-await-to-callbacks */
import debounce from 'lodash/debounce';
import MutationObserver from './helpers/MutationObserver';

const sizeMutationAttrs = ['style', 'width', 'height'];
const validate = (target, callback) => {
  if (!(target instanceof Element)) {
    throw new TypeError('Target is not an Element node');
  }

  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function');
  }
};

const onElementResize = function (target, callback, {threshold = 100} = {}) {
  validate(target, callback);

  const makeSizeId = ({style, clientHeight, clientWidth}) => [style.width, style.height, clientWidth, clientHeight].join('');
  let lastSize = makeSizeId(target);
  const checkElementSize = () => {
    const currentSize = makeSizeId(target);

    if (currentSize !== lastSize) {
      lastSize = currentSize;
      // eslint-disable-next-line callback-return
      callback();
    }
  };

  const checkElementHandler = threshold > 0 ? debounce(checkElementSize) : checkElementSize;

  const observer = new MutationObserver((mutations) => {
    for (let index = 0; index < mutations.length; index++) {
      const {attributeName} = mutations[index];

      if (sizeMutationAttrs.indexOf(attributeName) !== -1) {
        checkElementHandler();
      }
    }
  });

  observer.observe(target, {
    attributes: true,
    characterData: false,
    childList: true
  });

  return () => {
    observer.disconnect();
  };
};

export default onElementResize;
