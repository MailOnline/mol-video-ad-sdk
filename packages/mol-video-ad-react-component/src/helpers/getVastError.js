const getVastError = (vastChain) => {
  if (!vastChain || vastChain.length === 0) {
    return new Error('Invalid VastChain');
  }

  return vastChain[0].error;
};

export default getVastError;
