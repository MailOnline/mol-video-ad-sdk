import {
  vastWrapperXML,
  vastInlineXML,
  wrapperParsedXML,
  inlineParsedXML,
  wrapperAd,
  inlineAd,
  vastNoAdXML,
  noAdParsedXML

} from '../../../fixtures';
import getDetails from '../getDetails';

describe('getDetails', () => {
  let vastChain;
  let inlineVastChain;
  let noInlineVastChain;
  let emptyVastChain;

  beforeEach(() => {
    vastChain = [
      {
        ad: inlineAd,
        errorCode: null,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastInlineXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastWrapperXML
      },
      {
        ad: wrapperAd,
        errorCode: null,
        parsedXML: wrapperParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastWrapperXML
      }
    ];
    inlineVastChain = [vastChain[0]];
    noInlineVastChain = vastChain.slice(1);
    emptyVastChain = [
      {
        ad: undefined,
        errorCode: 900,
        parsedXML: noAdParsedXML,
        requestTag: 'http://adtag.test.example.com',
        XML: vastNoAdXML
      }
    ];
  });

  it('must return the adId and adWrapperIds', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adId: 'abc123',
      adWrapperIds: ['4367623109', '4367623109']
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adId: 'abc123',
      adWrapperIds: []
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adId: undefined,
      adWrapperIds: ['4367623109', '4367623109']
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adId: undefined,
      adWrapperIds: []
    }));
  });

  it('must return the adSystem and adWrapperSystems', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adSystem: 'MOL',
      adWrapperSystems: ['MOL', 'MOL']
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adSystem: 'MOL',
      adWrapperSystems: []
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adSystem: undefined,
      adWrapperSystems: ['MOL', 'MOL']
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adSystem: undefined,
      adWrapperSystems: []
    }));
  });

  it('must return the creativeId and adWrapperCreativeIds', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeIds: ['wrapper123', 'wrapper123'],
      creativeId: 'inline123'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeIds: [],
      creativeId: 'inline123'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeIds: ['wrapper123', 'wrapper123'],
      creativeId: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeIds: [],
      creativeId: undefined
    }));
  });

  it('must return the creativeAdId and adWrapperCreativeAdIds', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeAdIds: ['wrapper123', 'wrapper123'],
      creativeAdId: 'inline123'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeAdIds: [],
      creativeAdId: 'inline123'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeAdIds: ['wrapper123', 'wrapper123'],
      creativeAdId: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adWrapperCreativeAdIds: [],
      creativeAdId: undefined
    }));
  });

  it('must return the clickThroughUrl', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      clickThroughUrl: 'https://test.example.com/clickthrough'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      clickThroughUrl: 'https://test.example.com/clickthrough'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      clickThroughUrl: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      clickThroughUrl: undefined
    }));
  });

  it('must return the pricing, pricingCurrency and pricingModel', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      pricing: '25.00',
      pricingCurrency: 'EUR',
      pricingModel: 'cpm'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      pricing: '25.00',
      pricingCurrency: 'EUR',
      pricingModel: 'cpm'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      pricing: '25.00',
      pricingCurrency: 'USD',
      pricingModel: 'cpm'
    }));
    expect(getDetails([...emptyVastChain, ...inlineVastChain])).toEqual(expect.objectContaining({
      pricing: '25.00',
      pricingCurrency: 'EUR',
      pricingModel: 'cpm'
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      pricing: undefined,
      pricingCurrency: undefined,
      pricingModel: undefined
    }));
  });

  it('must return the category and categoryAuthority', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      category: 'Inline Video',
      categoryAuthority: 'IAB'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      category: 'Inline Video',
      categoryAuthority: 'IAB'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      category: undefined,
      categoryAuthority: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      category: undefined,
      categoryAuthority: undefined
    }));
  });

  it('must return the adServingId', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adServingId: 'ADID_INSIMPLETEST_ABC123'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adServingId: 'ADID_INSIMPLETEST_ABC123'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adServingId: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adServingId: undefined
    }));
  });

  it('must return the vastVersion', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      vastVersion: '4.0'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      vastVersion: '4.0'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      vastVersion: '3.0'
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      vastVersion: '4.0'
    }));

    expect(getDetails([
      {
        ad: undefined,
        errorCode: 900,
        parsedXML: '',
        requestTag: 'http://adtag.test.example.com',
        XML: vastNoAdXML
      }
    ])).toEqual(expect.objectContaining({
      vastVersion: 'unknown'
    }));
  });

  it('must return the advertiser and adTitle', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      adTitle: 'VAST 4.0 Test',
      advertiser: 'MOL',
      description: 'VAST Inline'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      adTitle: 'VAST 4.0 Test',
      advertiser: 'MOL',
      description: 'VAST Inline'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      adTitle: undefined,
      advertiser: undefined,
      description: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      adTitle: undefined,
      advertiser: undefined,
      description: undefined
    }));
  });

  it('must return the creativeData', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      creativeData: {
        AdParameters: 'qs=test&reddit=true',
        xmlEncoded: false
      }
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      creativeData: {
        AdParameters: 'qs=test&reddit=true',
        xmlEncoded: false
      }
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      creativeData: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      creativeData: undefined
    }));
  });

  it('must return the linear duration and durationInMs', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      duration: '00:00:30',
      durationInMs: 30000
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      duration: '00:00:30',
      durationInMs: 30000
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      duration: undefined,
      durationInMs: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      duration: undefined,
      durationInMs: undefined
    }));
  });

  it('must return the universalAdId', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      universalAdId: '8465',
      universalAdIdRegistry: 'Ad-ID'
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      universalAdId: '8465',
      universalAdIdRegistry: 'Ad-ID'
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      universalAdId: undefined,
      universalAdIdRegistry: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      universalAdId: undefined,
      universalAdIdRegistry: undefined
    }));
  });

  it('must return the media files', () => {
    expect(getDetails(vastChain).mediaFiles).toMatchSnapshot();
    expect(getDetails(inlineVastChain).mediaFiles).toMatchSnapshot();
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      mediaFiles: []
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      mediaFiles: []
    }));
  });

  it('must return vpaid flag', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      vpaid: false
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      vpaid: false
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      vpaid: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      vpaid: undefined
    }));
  });

  it('must return the skipOffset, skipOffsetInMs and skippable flag', () => {
    expect(getDetails(vastChain)).toEqual(expect.objectContaining({
      skipOffset: '00:00:05',
      skipOffsetInMs: 5000,
      skippable: true
    }));
    expect(getDetails(inlineVastChain)).toEqual(expect.objectContaining({
      skipOffset: '00:00:05',
      skipOffsetInMs: 5000,
      skippable: true
    }));
    expect(getDetails(noInlineVastChain)).toEqual(expect.objectContaining({
      skipOffset: undefined,
      skipOffsetInMs: undefined,
      skippable: undefined
    }));
    expect(getDetails(emptyVastChain)).toEqual(expect.objectContaining({
      skipOffset: undefined,
      skipOffsetInMs: undefined,
      skippable: undefined
    }));
  });
});
