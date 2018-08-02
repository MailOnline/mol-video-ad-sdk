/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import requestAd from '../vastRequest/requestAd';
import requestNextAd from '../vastRequest/requestNextAd';
import run from './run';

const callbackHandler = (cb) => (...args) => {
  if (typeof cb === 'function') {
    cb(...args);
  }
};
const waterfall = async (fetchVastChain, placeholder, options, isCanceled) => {
  let vastChain;
  let runEpoch;
  let adUnit;
  const opts = {...options};
  const {
    onAdStart,
    onError,
    onRunFinish
  } = opts;

  try {
    if (typeof opts.timeout === 'number') {
      runEpoch = Date.now();
    }

    vastChain = await fetchVastChain();

    if (isCanceled()) {
      onRunFinish();

      return;
    }

    if (runEpoch) {
      const newEpoch = Date.now();

      opts.timeout -= newEpoch - runEpoch;
      runEpoch = newEpoch;
    }

    adUnit = await run(vastChain, placeholder, {...opts});

    if (isCanceled()) {
      adUnit.cancel();
      onRunFinish();

      return;
    }

    onAdStart(adUnit);
    adUnit.onError(onError);
    adUnit.onFinish(onRunFinish);
  } catch (error) {
    onError(error);

    if (vastChain && !isCanceled()) {
      if (runEpoch) {
        opts.timeout -= Date.now() - runEpoch;
      }

      waterfall(() => requestNextAd(vastChain, opts), placeholder, {...opts}, isCanceled);

      return;
    }

    onRunFinish();
  }
};

/**
 * Will try to start one of the ads returned by the `adTag`. It will keep trying until it times out or it runs out of ads.
 *
 * @memberof module:@mol/video-ad-sdk
 * @static
 * @alias runWaterfall
 * @param {string} adTag - The VAST ad tag request url.
 * @param {HTMLElement} placeholder - placeholder element that will contain the video ad.
 * @param {Object} [options] - Options Map. The allowed properties are:
 * @param {HTMLVideoElement} [options.videoElement] - optional videoElement that will be used to play the ad.
 * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
 * Defaults to `window.console`
 * @param {number} [options.wrapperLimit] - Sets the maximum number of wrappers allowed in the {@link VastChain}.
 * @param {runWaterfall~onAdStart} [options.onAdStart] - will be called once the ad starts with the ad unit.
 * @param {runWaterfall~onError} [options.onError] - will be called if there is an error with the video ad with the error instance.
 * @param {runWaterfall~onRunFinish} [options.onRunFinish] - will be called whenever the ad run finishes.
 *  Defaults to `5`.
 * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
 * Defaults to `false`
 * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
 * Defaults to `false`
 * @param {number} [options.timeout] - timeout number in milliseconds. If set, the video ad will time out if it doesn't start within the specified time.
 * @param {TrackerFn} [options.tracker] - If provided it will be used to track the VAST events instead of the default {@link pixelTracker}.
 * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad.
 * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
 * @returns {Function} - Cancel function. If called it will cancel the ad run. {@link runWaterfall~onRunFinish} will still be called;
 */
const runWaterfall = (adTag, placeholder, options) => {
  let canceled = false;
  let adUnit = null;
  const isCanceled = () => canceled;
  const onAdStartHandler = callbackHandler(options.onAdStart);
  const onAdStart = (newAdUnit) => {
    adUnit = newAdUnit;
    onAdStartHandler(adUnit);
  };

  const opts = {
    ...options,
    onAdStart,
    onError: callbackHandler(options.onError),
    onRunFinish: callbackHandler(options.onRunFinish)
  };

  waterfall(
    () => requestAd(adTag, opts),
    placeholder,
    opts,
    isCanceled
  );

  return () => {
    canceled = true;

    if (adUnit && !adUnit.isFinished()) {
      adUnit.cancel();
    }
  };
};

export default runWaterfall;

/**
 * Called once the ad starts.
 *
 * @callback RunWaterfall~onAdStart
 * @param {VastAdUnit | VideoAdUnit} adUnit - the ad unit instance.
 */

/**
 * Called whenever the an error occurs within the ad unit. It may be called several times with different errors
 *
 * @callback RunWaterfall~onError
 * @param {Error} error - the ad unit error.
 */

/**
 * Called once the ad run is finished. It will be called no matter how the run was finished (due to an ad complete or an error). It can be used to know when to unmount the component.
 *
 * @callback RunWaterfall~onRunFinish
 */
