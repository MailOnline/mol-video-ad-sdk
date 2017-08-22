import {getAds} from 'mol-vast-selectors';

const getNextAd = ({parsedXML}) => {
  const ads = getAds(parsedXML);

  if (Array.isArray(ads)) {
    const nextAd = ads.filter((ad) => !ad.___requested)[0];

    if (nextAd) {
      // eslint-disable-next-line id-match
      nextAd.___requested = true;

      return nextAd;
    }
  }

  return null;
};

export default getNextAd;
