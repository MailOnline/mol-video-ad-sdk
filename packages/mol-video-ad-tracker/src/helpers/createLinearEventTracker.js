import pixelTracker from './pixelTracker';

const createLinearEventTracker = (vastChainSelector) => (vastChain, {data, tracker = pixelTracker} = {}) => {
  vastChain.forEach(({ad}) => {
    const value = vastChainSelector(ad);

    if (Boolean(value)) {
      switch (true) {
      case typeof value === 'string': {
        tracker(value, data);
        break;
      }
      case Array.isArray(value): {
        value.map(({uri}) => tracker(uri, data));
        break;
      }
      }
    }
  });
};

export default createLinearEventTracker;
