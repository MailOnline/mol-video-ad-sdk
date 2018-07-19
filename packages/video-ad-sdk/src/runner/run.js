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

/**
 * Will try to start video ad in the passed {@see VastChain} and return the started VideoAdUnit.
 *
 * @memberof module:@mol/video-ad-sdk
 * @static
 * @throws if there is an error starting the ad or it times out (by throw I mean that it will reject promise with the error).
 * @param {VastChain} vastChain - The {@see VastChain} with all the {@see VastResponse}s.
 * @param {HTMLElement} placeholder - placeholder element that will contain the video ad.
 * @param {Object} [options] - Options Map. The allowed properties are:
 * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
 * Defaults to `window.console`
 * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
 * Defaults to `false`
 * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
 * Defaults to `false`
 * @param {number} [options.timeout] - timeout number in milliseconds. If set, the video ad will time out if it doesn't start within the specified time.
 * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad.
 * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
 * @returns {Promise.<VastAdUnit|VpaidAdUnit>} - The video ad unit.
 */
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
