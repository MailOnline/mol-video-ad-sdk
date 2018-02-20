/* eslint-disable promise/prefer-await-to-callbacks */
import MutationObserver from './helpers/MutationObserver';

const toArray = (...list) => [...list];
const validate = (target, callback) => {
  if (!(target instanceof Element)) {
    throw new TypeError('Target is not an Element node');
  }

  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function');
  }
};

const onElementRemove = function (target, callback) {
  validate(target, callback);

  const observer = new MutationObserver((mutations) => {
    for (let index = 0; index < mutations.length; index++) {
      const {removedNodes} = mutations[index];
      const removedNodesArray = toArray(removedNodes);

      if (removedNodesArray.length > 0 && removedNodes.some((node) => node === target)) {
        callback();

        return;
      }
    }
  });

  observer.observe(target, {
    attributes: false,
    characterData: false,
    childList: true
  });

  return () => {
    observer.disconnect();
  };
};

export default onElementRemove;
