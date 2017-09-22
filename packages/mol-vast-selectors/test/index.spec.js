import {
  inlineAd,
  inlineParsedXML,
  podParsedXML,
  wrapperAd,
  wrapperParsedXML,
  noAdParsedXML
} from 'mol-vast-fixtures';
import {
  getAds,
  getFirstAd,
  getVASTAdTagURI,
  getWrapperOptions,
  hasAdPod,
  getPodAdSequence,
  isPodAd,
  isInline,
  isWrapper
} from '../src/index';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

test('getAds must return the ads of the passed adResponse or null otherwise', () => {
  expect(getAds(wrapperParsedXML)).toEqual([wrapperAd]);
  expect(getAds(noAdParsedXML)).toBe(null);
  expect(getAds({})).toBe(null);
});

test('getFirstAd must return the first ad of the passed adResponse or null otherwise', () => {
  expect(getFirstAd(wrapperParsedXML)).toEqual(wrapperAd);
  expect(getFirstAd({})).toBe(null);
});

test('getFirsAd must return the firs ad in the sequence if the passed VAST has an ad pod', () => {
  const ad = getFirstAd(podParsedXML);
  const {id} = ad.attributes;

  expect(id).toBe('1234');
});

test('isWrapper must return true if the ad contains a wrapper and false otherwise', () => {
  expect(isWrapper(wrapperAd)).toBe(true);
  expect(isWrapper(inlineAd)).toBe(false);
  expect(isWrapper({})).toBe(false);
  expect(isWrapper(null)).toBe(false);
  expect(isWrapper(1)).toBe(false);
});

test('isInline must return true if the ad contains a wrapper and false otherwise', () => {
  expect(isInline(inlineAd)).toBe(true);
  expect(isInline(wrapperAd)).toBe(false);
  expect(isInline({})).toBe(false);
  expect(isInline(null)).toBe(false);
  expect(isInline(1)).toBe(false);
});

test('getVASTAdTagURI must return the VASTAdTagURI from the wrapper ad or null otherwise', () => {
  expect(getVASTAdTagURI(wrapperAd)).toBe('https://test.example.com/vastadtaguri');
  expect(getVASTAdTagURI(inlineAd)).toBe(null);
});

test('hasAdPod must return true if the passed ads have an ad pod and false otherwise', () => {
  expect(hasAdPod(podParsedXML)).toBe(true);
  expect(hasAdPod(inlineParsedXML)).toBe(false);
  expect(hasAdPod({})).toBe(false);
});

test('hasAdPod must return false if the there is only one ad with a sequence', () => {
  const podAds = getAds(podParsedXML);

  podParsedXML.elements[0].elements = [podAds[1]];

  expect(hasAdPod(podParsedXML)).toBe(false);

  podParsedXML.elements[0].elements = podAds;
});

test('getPodAdSequence mus return the sequence of the ad or false otherwise', () => {
  const ads = getAds(podParsedXML);

  expect(getPodAdSequence(ads[0])).toBe(null);
  expect(getPodAdSequence(ads[1])).toBe(1);
});

test('isPodAd must return true if the ad has a sequence and false otherwise', () => {
  const ads = getAds(podParsedXML);

  expect(isPodAd(ads[0])).toBe(false);
  expect(isPodAd(ads[1])).toBe(true);
});

test('getWrapperOptions mus return the options of the ad or {} otherwise', () => {
  expect(getWrapperOptions(inlineAd)).toEqual({});
  expect(getWrapperOptions(wrapperAd)).toEqual({allowMultipleAds: true});

  const wrapperAdClone = clone(wrapperAd);
  const wrapperAttrs = wrapperAdClone.elements[0].attributes;

  wrapperAttrs.allowMultipleAds = 'false';

  expect(getWrapperOptions(wrapperAdClone)).toEqual({allowMultipleAds: false});

  wrapperAttrs.allowMultipleAds = true;
  wrapperAttrs.followAdditionalWrappers = 'false';

  expect(getWrapperOptions(wrapperAdClone)).toEqual({
    allowMultipleAds: true,
    followAdditionalWrappers: false
  });

  wrapperAttrs.fallbackOnNoAd = 'true';

  expect(getWrapperOptions(wrapperAdClone)).toEqual({
    allowMultipleAds: true,
    fallbackOnNoAd: true,
    followAdditionalWrappers: false
  });
});
