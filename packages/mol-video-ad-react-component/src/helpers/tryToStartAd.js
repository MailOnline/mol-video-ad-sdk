import {createVideoAdContainer} from 'mol-video-ad-sdk';
import startVideoAd from './startVideoAd';
import loadNextVastChain from './loadNextVastChain';

const tryToStartAd = async (fetchVastChain, placeholder, options) => {
  let vastChain;
  let onError;
  let videoAdContainer;

  try {
    onError = options.onError;
    vastChain = await fetchVastChain();
    videoAdContainer = await createVideoAdContainer(placeholder, options);

    const adUnit = await startVideoAd(vastChain, videoAdContainer, options);

    return adUnit;
  } catch (error) {
    if (videoAdContainer) {
      videoAdContainer.destroy();
    }

    if (vastChain) {
      if (onError) {
        onError(error);
      }

      return tryToStartAd(() => loadNextVastChain(vastChain, options), placeholder, options);
    }

    throw error;
  }
};

export default tryToStartAd;
