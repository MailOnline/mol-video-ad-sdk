import Deferred from './Deferred';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
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
    mutations.forEach(({removedNodes}) => {
      if (removedNodes.length > 1) {
        const removedObservedNodes = getRemovedObservedNodes(removedNodes);

        removedObservedNodes.forEach((observedNode) => {
          const {node, deferred} = observedNode;

          observedNodes = observedNodes.filter((item) => item !== observedNode);
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
    deferred.reject(new Error('MutationObserve API is not supported'));
  }

  return deferred.promise;
};

export default waitForNodeRemoval;
