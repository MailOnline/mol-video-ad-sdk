import requestAd from '../vastRequest/requestAd';
import requestNextAd from '../vastRequest/requestNextAd';
import run from './run';

const waterfall = async (fetchVastChain, placeholder, options) => {
  let vastChain;
  let runEpoch;

  const opts = {...options};

  try {
    if (typeof opts.timeout === 'number') {
      runEpoch = Date.now();
    }

    vastChain = await fetchVastChain();

    if (runEpoch) {
      const newEpoch = Date.now();

      opts.timeout -= newEpoch - runEpoch;
      runEpoch = newEpoch;
    }

    const adUnit = await run(vastChain, placeholder, {...opts});

    return adUnit;
  } catch (error) {
    const onError = opts.onError;

    /* istanbul ignore else */
    if (onError) {
      onError({
        error,
        vastChain
      });
    }

    if (vastChain) {
      if (runEpoch) {
        opts.timeout -= Date.now() - runEpoch;
      }

      return waterfall(() => requestNextAd(vastChain, opts), placeholder, {...opts});
    }

    throw error;
  }
};

/**
 * Will try to start one of the ads returned by the `adTag`. It will keep trying until it times out or it runs out of ads.
 *
 * @memberof module:@mol/video-ad-sdk
 * @static
 * @throws if there is an error starting the ad or it times out (by throw I mean that it will reject promise with the error).
 * @param {string} adTag - The VAST ad tag request url.
 * @param {HTMLElement} placeholder - placeholder element that will contain the video ad.
 * @param {Object} [options] - Options Map. The allowed properties are:
 * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
 * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
 * Defaults to `window.console`
 * @param {number} [options.wrapperLimit] - Sets the maximum number of wrappers allowed in the {@link VastChain}.
 *  Defaults to `5`.
 * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
 * Defaults to `false`
 * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
 * Defaults to `false`
 * @param {number} [options.timeout] - timeout number in milliseconds. If set, the video ad will time out if it doesn't start within the specified time.
 * @param {TrackerFn} [options.tracker] - If provided it will be used to track the VAST events instead of the default {@link pixelTracker}.
 * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad.
 * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
 * @returns {Promise.<VastAdUnit|VpaidAdUnit>} - The video ad unit.
 */
const runWaterfall = (adTag, placeholder, options) =>
  waterfall(
    () => requestAd(adTag, options),
    placeholder,
    options
  );

export default runWaterfall;
