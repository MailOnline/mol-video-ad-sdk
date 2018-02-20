import {load} from '@mol/video-ad-sdk';
import getVastError from './getVastError';

const loadVastChain = async (tag, options) => {
  const vastChain = await load(tag, options);
  const error = getVastError(vastChain);

  if (error) {
    throw error;
  }

  return vastChain;
};

export default loadVastChain;
