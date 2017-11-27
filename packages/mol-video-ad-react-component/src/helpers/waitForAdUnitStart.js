const waitForAdUnitStart = (adUnit) => new Promise((resolve, reject) => {
  adUnit.onError(reject);
  adUnit.on('start', () => resolve(adUnit));

  adUnit.start();
});

export default waitForAdUnitStart;
