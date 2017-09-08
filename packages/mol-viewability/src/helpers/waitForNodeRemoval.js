import Deferred from './Deferred';
import MutationObserver from './MutationObserver';

const toArray = (nodelist) => Array.prototype.slice.call(nodelist);
let observedNodes = [];
let observer = null;

if (MutationObserver) {
  const getRemovedObservedNodes = (removedNodes) => {
    const removedObservedNodes = [];

    observedNodes.forEach((observedNode) => {
      if (removedNodes.indexOf(observedNode.node) !== -1) {
        removedObservedNodes.push(observedNode);
      }
    });

    return removedObservedNodes;
  };

  observer = new MutationObserver((mutations) => {
    toArray(mutations)
      .forEach(({removedNodes}) => {
        if (removedNodes.length > 0) {
          const removedObservedNodes = getRemovedObservedNodes(toArray(removedNodes));

          removedObservedNodes.forEach((observedNode) => {
            const {node, deferred} = observedNode;

            observedNodes = observedNodes.filter((item) => item !== observedNode);

            if (observedNodes.length === 0) {
              observer.disconnect();
            }

            deferred.resolve(node);
          });
        }
      });
  });
}

const waitForNodeRemoval = (node) => {
  const deferred = new Deferred();

  observedNodes.push({
    deferred,
    node
  });

  if (observer) {
    observer.observe(node.parentNode || node, {
      childList: true
    });
  } else {
    deferred.reject(new Error('MutationObserver API is not supported'));
  }

  return deferred.promise;
};

export default waitForNodeRemoval;
