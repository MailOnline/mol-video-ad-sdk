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
    const {timeout} = options;

    videoAdContainer = createVideoAdContainer(placeholder, options.videoElement);
    let adUnitPromise = startVideoAd(vastChain, videoAdContainer, options);

    if (typeof timeout === 'number') {
      let timedOut = false;
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          const {tracker} = options;

          trackError(vastChain, {
            errorCode: 402,
            tracker
          });
          timedOut = true;
          reject(new Error('Timeout while starting the ad'));
        }, options.timeout);
      });

      adUnitPromise = Promise.race([
        // eslint-disable-next-line promise/prefer-await-to-then
        adUnitPromise.then((newAdUnit) => {
          if (timedOut && newAdUnit.isStarted()) {
            newAdUnit.cancel();
          }

          return newAdUnit;
        }),
        timeoutPromise
      ]);
    }

    const adUnit = await adUnitPromise;

    return adUnit;
  } catch (error) {
    if (videoAdContainer) {
      videoAdContainer.destroy();
    }

    throw error;
  }
};

export default run;
