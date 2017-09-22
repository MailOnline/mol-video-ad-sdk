import VastAdUnit from './VastAdUnit';

const createVastAdUnit = (vastAdChain, videoAdContainer, options) =>
  Promise.resolve(new VastAdUnit(vastAdChain, videoAdContainer, options));

export default createVastAdUnit;
