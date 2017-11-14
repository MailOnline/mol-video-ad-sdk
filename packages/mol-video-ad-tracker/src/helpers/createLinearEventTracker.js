import pixelTracker from './pixelTracker';

const createLinearEventTracker = (vastChainSelector) => (vastChain, {data, tracker = pixelTracker} = {}) => {
  const eventUris = [];

  vastChain.forEach(({ad}) => {
    const value = vastChainSelector(ad);

    if (Boolean(value)) {
      switch (true) {
      case typeof value === 'string': {
        eventUris.push(value);
        break;
      }
      case Array.isArray(value): {
        const uris = value.map(({uri}) => uri);

        eventUris.push(...uris);
        break;
      }
      }
    }
  });

  eventUris.forEach((macro) => tracker(macro, data));
};

export default createLinearEventTracker;
