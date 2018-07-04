import {trackError} from '../tracker';
import createVideoAdContainer from '../adContainer/createVideoAdContainer';
import startVideoAd from './helpers/startVideoAd';

const validateVastChain = (vastChain, options) => {
  if (!vastChain || vastChain.length === 0) {
    throw new Error('Invalid VastChain');
  }

  const lastVastResponse = vastChain[0];

  if (Boolean(lastVastResponse.errorCode)) {
    const {tracker} = options;

    trackError(vastChain, {
      errorCode: lastVastResponse.errorCode,
      tracker
    });
  }

  if (Boolean(lastVastResponse.error)) {
    throw lastVastResponse.error;
  }
};

const run = async (vastChain, placeholder, options) => {
  let videoAdContainer;

  try {
    validateVastChain(vastChain, options);

    videoAdContainer = await createVideoAdContainer(placeholder, options);

    const adUnit = await startVideoAd(vastChain, videoAdContainer, options);

    return adUnit;
  } catch (error) {
    if (videoAdContainer) {
      videoAdContainer.destroy();
    }

    if (vastChain) {
      const onError = options.onError;

      if (onError) {
        onError({
          error,
          vastChain
        });
      }
    }

    throw error;
  }
};

export default run;
