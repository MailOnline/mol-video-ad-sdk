import pixelTracker from './pixelTracker';

const createLinearEventTracker = (vastChainSelector) => (vastChain, {data, tracker = pixelTracker} = {}) => {
  const eventUris = [];

  vastChain.forEach(({ad}) => {
    const uri = vastChainSelector(ad);

    if (Boolean(uri)) {
      eventUris.push(uri);
    }
  });

  eventUris.forEach((macro) => tracker(macro, data));
};

export default createLinearEventTracker;
