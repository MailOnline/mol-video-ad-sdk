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

const runWaterfall = (adTag, placeholder, options) =>
  waterfall(
    () => requestAd(adTag, options),
    placeholder,
    options
  );

export default runWaterfall;
