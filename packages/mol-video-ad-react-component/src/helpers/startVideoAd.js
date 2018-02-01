import {
  createVideoAdContainer,
  createVideoAdUnit
} from 'mol-video-ad-sdk';
import loadNextVastChain from './loadNextVastChain';
import waitForAdUnitStart from './waitForAdUnitStart';

const startVideoAd = async (fetchVastChain, placeholder, options) => {
  let vastChain;
  let videoAdContainer;
  let adUnit;
  const {
    onError
  } = options;

  try {
    vastChain = await fetchVastChain();
    videoAdContainer = await createVideoAdContainer(placeholder, options);
    adUnit = await createVideoAdUnit(vastChain, videoAdContainer, options);

    const result = await waitForAdUnitStart(adUnit);

    if (result instanceof Error) {
      throw result;
    }

    return result;
  } catch (error) {
    if (adUnit) {
      adUnit.cancel();
    }

    if (videoAdContainer) {
      videoAdContainer.destroy();
    }

    if (vastChain) {
      if (onError) {
        onError(error);
      }

      return startVideoAd(() => loadNextVastChain(vastChain, options), placeholder, options);
    }

    throw error;
  }
};

export default startVideoAd;
