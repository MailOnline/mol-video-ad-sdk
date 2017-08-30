import {
  hasAdPod,
  getAds,
  getPodAdSequence,
  isPodAd
} from 'mol-vast-selectors';

const getNextPod = (currentPod, ads) => {
  const nextPodSequence = getPodAdSequence(currentPod) + 1;

  return ads.find((ad) => getPodAdSequence(ad) === nextPodSequence) || null;
};

const getNextAd = ({ad, parsedXML}, {fallbackOnNoAd = true, useAdBuffet = false} = {}) => {
  const ads = getAds(parsedXML);
  const isAdPod = hasAdPod(parsedXML);
  const availableAds = ads.filter((adDefinition) => !adDefinition.___requested);
  let nextAd = null;

  if (isAdPod) {
    if (useAdBuffet) {
      nextAd = availableAds.filter((adDefinition) => !isPodAd(adDefinition))[0];
    }

    if (!nextAd) {
      nextAd = getNextPod(ad, availableAds);
    }
  } else if (availableAds.length > 0 && fallbackOnNoAd) {
    nextAd = availableAds[0];
  }

  return nextAd;
};

export default getNextAd;
