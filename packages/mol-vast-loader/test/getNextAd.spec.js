/* eslint-disable id-match */
import {
  getAds,
  isPodAd
} from 'mol-vast-selectors';
import {
  wrapperParsedXML,
  podParsedXML,
  waterfallParsedXML,
  wrapperAd
} from 'mol-vast-fixtures';
import getNextAd from '../src/helpers/getNextAd';
import {markAdAsRequested, unmarkAdAsRequested} from '../src/helpers/adUtils';

const markAdsAsRequested = (parsedXml) => {
  getAds(parsedXml).forEach(markAdAsRequested);
};

const unmarkAdsAsRequested = (parsedXml) => {
  getAds(parsedXml).forEach(unmarkAdAsRequested);
};

test('getNextAd must return null if there is no next ad definition in the waterfall', () => {
  markAdAsRequested(wrapperAd);

  expect(getNextAd({
    ad: wrapperAd,
    parsedXML: wrapperParsedXML
  }, {})).toBe(null);

  markAdsAsRequested(waterfallParsedXML);
  const waterfallAds = getAds(waterfallParsedXML);

  expect(getNextAd({
    ad: waterfallAds[0],
    parsedXML: waterfallParsedXML
  }, {})).toBe(null);

  unmarkAdsAsRequested(waterfallParsedXML);
  unmarkAdAsRequested(wrapperAd);
});

test('getNextAd must get the next available ad definition if fallbackOnNoAd is true', () => {
  const waterfallAds = getAds(waterfallParsedXML);

  markAdAsRequested(waterfallAds[0]);

  expect(getNextAd({
    ad: waterfallAds[0],
    parsedXML: waterfallParsedXML
  }, {fallbackOnNoAd: true})).toBe(waterfallAds[1]);

  unmarkAdAsRequested(waterfallAds[0]);
});

test('getNextAd must return null if fallbackOnNoAd is false', () => {
  const waterfallAds = getAds(waterfallParsedXML);

  expect(getNextAd({
    ad: waterfallAds[0],
    parsedXML: waterfallParsedXML
  }, {fallbackOnNoAd: false})).toBe(null);
});

test('getNextAd must get the next ad definition on the ad Pod sequence', () => {
  const ads = getAds(podParsedXML);
  const podAds = ads.filter(isPodAd);

  markAdAsRequested(podAds[0]);

  expect(getNextAd({
    ad: podAds[0],
    parsedXML: podParsedXML
  }, {})).toBe(podAds[1]);

  unmarkAdAsRequested(podAds[0]);
});

test('getNextAd must return null if there is no next pod in the ad pod sequence', () => {
  const ads = getAds(podParsedXML);
  const podAds = ads.filter(isPodAd);

  markAdsAsRequested(podParsedXML);

  expect(getNextAd({
    ad: podAds[0],
    parsedXML: podParsedXML
  }, {})).toBe(null);

  unmarkAdsAsRequested(podParsedXML);
});

test('getNextAd with useAdBuffet option flag set to true must get an ad definition from the adBuffet of the adPod', () => {
  const ads = getAds(podParsedXML);
  const podAds = ads.filter(isPodAd);
  const buffetAds = ads.filter((ad) => !isPodAd(ad));

  markAdAsRequested(podAds[0]);

  expect(getNextAd({
    ad: podAds[0],
    parsedXML: podParsedXML
  }, {useAdBuffet: true})).toBe(buffetAds[0]);

  unmarkAdAsRequested(podAds[0]);
});

test('getNextAd with useAdBuffet option flag set to true must get the next ad definition on the adPod sequence if there are no more adBuffets to serve', () => {
  const ads = getAds(podParsedXML);
  const podAds = ads.filter(isPodAd);
  const buffetAds = ads.filter((ad) => !isPodAd(ad));

  markAdAsRequested(podAds[0]);
  markAdAsRequested(buffetAds[0]);

  expect(getNextAd({
    ad: podAds[0],
    parsedXML: podParsedXML
  }, {useAdBuffet: true})).toBe(podAds[1]);

  unmarkAdAsRequested(podAds[0]);
  unmarkAdAsRequested(buffetAds[0]);
});
