import createVideoAdUnit from '../../adUnit/createVideoAdUnit';

const waitForAdUnitStart = (adUnit) => new Promise((resolve, reject) => {
  adUnit.onError(reject);
  adUnit.on('start', () => resolve(adUnit));

  adUnit.start();
});

const startVideoAd = async (vastChain, videoAdContainer, options) => {
  let adUnit;

  try {
    adUnit = createVideoAdUnit(vastChain, videoAdContainer, options);

    await waitForAdUnitStart(adUnit);

    return adUnit;
  } catch (error) {
    if (adUnit) {
      adUnit.cancel();
    }

    throw error;
  }
};

export default startVideoAd;
