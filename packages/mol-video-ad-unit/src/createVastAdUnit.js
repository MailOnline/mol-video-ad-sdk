import {VideoAdContainer} from 'mol-video-ad-container';
import VastAdUnit from './VastAdUnit';

const createVastAdUnit = (vastAdChain, videoAdContainer, options = {}) => {
  if (!Array.isArray(vastAdChain) || vastAdChain.length === 0) {
    throw new TypeError('Invalid VastAdChain');
  }

  // We are not using instanceOf until https://github.com/facebook/jest/issues/4892 gets solved
  if (!(videoAdContainer.constructor.name === VideoAdContainer.name)) {
    throw new TypeError('Invalid VideoAdContainer');
  }

  return Promise.resolve(new VastAdUnit(vastAdChain, videoAdContainer, options));
};

export default createVastAdUnit;
