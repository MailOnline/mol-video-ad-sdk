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
  getAdError,
  getFirstAd,
  getLinearProgressEvents,
  getLinearTrackingEvents,
  getLinearTimeSpentViewingEvents,
  getMediaFiles,
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

test('getWrapperOptions must return the options of the ad or {} otherwise', () => {
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

test('getAdError must return the error uri of the inline/wrapper or null if missing', () => {
  expect(getAdError(inlineAd)).toBe('https://test.example.com/error');
  expect(getAdError(wrapperAd)).toBe('https://test.example.com/error/[ERRORCODE]');
  expect(getAdError()).toEqual(null);
  expect(getAdError(null)).toEqual(null);
  expect(getAdError({})).toEqual(null);
});

test('getMediaFiles must return null for wrong ads', () => {
  expect(getMediaFiles()).toEqual(null);
  expect(getMediaFiles(null)).toEqual(null);
  expect(getMediaFiles({})).toEqual(null);
  expect(getMediaFiles(wrapperAd)).toEqual(null);
});

test('getMediaFiles must return the mediafiles', () => {
  const mediaFiles = getMediaFiles(inlineAd);

  expect(mediaFiles).toBeInstanceOf(Array);
  expect(mediaFiles.length).toBe(1);
  expect(mediaFiles[0]).toEqual({
    bitrate: '600',
    codec: undefined,
    delivery: 'progressive',
    height: '1080',
    id: undefined,
    maintainAspectRatio: 'true',
    maxBitrate: undefined,
    minBitrate: undefined,
    scalable: 'true',
    src: 'https://test.example.com/test.mp4',
    type: 'video/mp4',
    universalAdId: 'unknown',
    width: '1920'
  });
});

test('getLinearTrackingEvents must return null if there are no linear tracking events', () => {
  expect(getLinearTrackingEvents()).toEqual(null);
  expect(getLinearTrackingEvents(null)).toEqual(null);
  expect(getLinearTrackingEvents({})).toEqual(null);
  expect(getLinearTrackingEvents(noAdParsedXML)).toEqual(null);
});

test('getLinearTrackingEvents must return the linear tracking events', () => {
  expect(getLinearTrackingEvents(inlineAd)).toEqual([
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeView'
    },
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstQuartile'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdQuartile'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete'
    },
    {
      event: 'timeSpentViewing',
      offset: 5000,
      uri: 'https://test.example.com/timeSpentViewing'
    },
    {
      event: 'timeSpentViewing',
      offset: '15%',
      uri: 'https://test.example.com/timeSpentViewing2'
    }
  ]);

  expect(getLinearTrackingEvents(wrapperAd)).toEqual([
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start'
    },
    {
      event: 'start',
      offset: undefined,
      uri: 'https://test.example.com/start2'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstquartile'
    },
    {
      event: 'firstQuartile',
      offset: undefined,
      uri: 'https://test.example.com/firstquartile2'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint'
    },
    {
      event: 'midpoint',
      offset: undefined,
      uri: 'https://test.example.com/midpoint2'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdquartile'
    },
    {
      event: 'thirdQuartile',
      offset: undefined,
      uri: 'https://test.example.com/thirdquartile2'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete'
    },
    {
      event: 'complete',
      offset: undefined,
      uri: 'https://test.example.com/complete2'
    },
    {
      event: 'mute',
      offset: undefined,
      uri: 'https://test.example.com/mute'
    },
    {
      event: 'mute',
      offset: undefined,
      uri: 'https://test.example.com/mute2'
    },
    {
      event: 'unmute',
      offset: undefined,
      uri: 'https://test.example.com/unmute'
    },
    {
      event: 'unmute',
      offset: undefined,
      uri: 'https://test.example.com/unmute2'
    },
    {
      event: 'rewind',
      offset: undefined,
      uri: 'https://test.example.com/rewind'
    },
    {
      event: 'rewind',
      offset: undefined,
      uri: 'https://test.example.com/rewind2'
    },
    {
      event: 'pause',
      offset: undefined,
      uri: 'https://test.example.com/pause'
    },
    {
      event: 'pause',
      offset: undefined,
      uri: 'https://test.example.com/pause2'
    },
    {
      event: 'progress',
      offset: 5000,
      uri: 'https://test.example.com/progress'
    },
    {
      event: 'progress',
      offset: '15%',
      uri: 'https://test.example.com/progress2'
    },
    {
      event: 'resume',
      offset: undefined,
      uri: 'https://test.example.com/resume'
    },
    {
      event: 'resume',
      offset: undefined,
      uri: 'https://test.example.com/resume2'
    },
    {
      event: 'fullscreen',
      offset: undefined,
      uri: 'https://test.example.com/fullscreen'
    },
    {
      event: 'fullscreen',
      offset: undefined,
      uri: 'https://test.example.com/fullscreen2'
    },
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeview'
    },
    {
      event: 'creativeView',
      offset: undefined,
      uri: 'https://test.example.com/creativeview2'
    },
    {
      event: 'exitFullscreen',
      offset: undefined,
      uri: 'https://test.example.com/exitfullscreen'
    },
    {
      event: 'exitFullscreen',
      offset: undefined,
      uri: 'https://test.example.com/exitfullscreen'
    },
    {
      event: 'acceptInvitationLinear',
      offset: undefined,
      uri: 'https://test.example.com/acceptinvitationlinear'
    },
    {
      event: 'acceptInvitationLinear',
      offset: undefined,
      uri: 'https://test.example.com/acceptinvitationlinear2'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closelinear'
    },
    {
      event: 'closeLinear',
      offset: undefined,
      uri: 'https://test.example.com/closelinear'
    }
  ]);
});

test('getLinearProgressEvents must return null if there are no progress tracking events', () => {
  expect(getLinearProgressEvents()).toEqual(null);
  expect(getLinearProgressEvents(null)).toEqual(null);
  expect(getLinearProgressEvents({})).toEqual(null);
  expect(getLinearProgressEvents(inlineAd)).toEqual(null);
});

test('getLinearProgressEvents must return the linear progress events', () => {
  expect(getLinearProgressEvents(wrapperAd)).toEqual([
    {
      event: 'progress',
      offset: 5000,
      uri: 'https://test.example.com/progress'
    },
    {
      event: 'progress',
      offset: '15%',
      uri: 'https://test.example.com/progress2'
    }
  ]);
});

test('getLinearTimeSpentViewingEvents must return null if there are no timeSpentViewing tracking events', () => {
  expect(getLinearTimeSpentViewingEvents()).toEqual(null);
  expect(getLinearTimeSpentViewingEvents(null)).toEqual(null);
  expect(getLinearTimeSpentViewingEvents({})).toEqual(null);
  expect(getLinearTimeSpentViewingEvents(wrapperAd)).toEqual(null);
});

test('getLinearTimeSpentViewingEvents must return the linear timeSpentViewing events', () => {
  expect(getLinearTimeSpentViewingEvents(inlineAd)).toEqual([
    {
      event: 'timeSpentViewing',
      offset: 5000,
      uri: 'https://test.example.com/timeSpentViewing'
    },
    {
      event: 'timeSpentViewing',
      offset: '15%',
      uri: 'https://test.example.com/timeSpentViewing2'
    }
  ]);
});
