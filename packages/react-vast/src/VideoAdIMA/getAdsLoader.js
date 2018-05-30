// NOTE: adsLoader has to be singleton for the whole page.
let adsLoader;

const getAdsLoader = (adDisplayContainer) => {
  if (!adsLoader) {
    adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);
  }

  return adsLoader;
};

export default getAdsLoader;
