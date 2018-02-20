import {loadNext} from '@mol/video-ad-sdk';
import getVastError from './getVastError';

const loadNextVastChain = async (vastChain, options) => {
  const newVastChain = await loadNext(vastChain, options);
  const error = getVastError(newVastChain);

  if (error) {
    throw error;
  }

  return newVastChain;
};

export default loadNextVastChain;
