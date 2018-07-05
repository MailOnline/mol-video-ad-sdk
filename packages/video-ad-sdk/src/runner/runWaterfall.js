import requestAd from '../vastRequest/requestAd';
import requestNextAd from '../vastRequest/requestNextAd';
import run from './run';

const waterfall = async (fetchVastChain, placeholder, options) => {
  let vastChain;

  try {
    vastChain = await fetchVastChain();

    const adUnit = await run(vastChain, placeholder, options);

    return adUnit;
  } catch (error) {
    const onError = options.onError;

    /* istanbul ignore else */
    if (onError) {
      onError({
        error,
        vastChain
      });
    }

    if (vastChain) {
      return waterfall(() => requestNextAd(vastChain, options), placeholder, options);
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
