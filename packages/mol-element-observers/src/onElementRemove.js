/* eslint-disable promise/prefer-await-to-callbacks */
import MutationObserver from './helpers/MutationObserver';

const toArray = (nodelist) => Array.prototype.slice.call(nodelist);
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

      if (removedNodesArray.length > 0 && Boolean(removedNodes.find((node) => node === target))) {
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
