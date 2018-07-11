import {
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../fixtures';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import loadCreative from '../helpers/vpaid/loadCreative';
import handshake from '../helpers/vpaid/handshake';
import initAd from '../helpers/vpaid/initAd';
import VpaidAdUnit from '../VpaidAdUnit';
import {adLoaded} from '../helpers/vpaid/vpaidEvents';
import MockVpaidCreativeAd from './MockVpaidCreativeAd';

jest.mock('../helpers/vpaid/loadCreative');
jest.mock('../helpers/vpaid/handshake');
jest.mock('../helpers/vpaid/initAd');

describe('VpaidAdUnit', () => {
  let vpaidChain;
  let videoAdContainer;

  beforeEach(() => {
    vpaidChain = [
      {
        ad: vpaidInlineAd,
        errorCode: null,
        parsedXML: vpaidInlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastVpaidInlineXML
      }
    ];
    videoAdContainer = new VideoAdContainer(document.createElement('DIV'));
  });

  test('must load the creative and publish the passed vastChain and ontainer', () => {
    const adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

    expect(adUnit.vastChain).toBe(vpaidChain);
    expect(adUnit.videoAdContainer).toBe(videoAdContainer);
    expect(loadCreative).toHaveBeenCalledTimes(1);
    expect(loadCreative).toHaveBeenCalledWith(vpaidChain, videoAdContainer);
  });

  describe('start', () => {
    test('must start the ad', async () => {
      const mockCreativeAd = new MockVpaidCreativeAd();

      // eslint-disable-next-line max-nested-callbacks
      initAd.mockImplementation(() => {
        mockCreativeAd.emit(adLoaded);
      });
      loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));

      const adUnit = new VpaidAdUnit(vpaidChain, videoAdContainer);

      expect(adUnit.isStarted()).toBe(false);

      const res = await adUnit.start();

      expect(res).toBe(adUnit);
      expect(adUnit.isStarted()).toBe(true);
      expect(adUnit.creativeAd).toBe(mockCreativeAd);
      expect(handshake).toHaveBeenCalledTimes(1);
      expect(handshake).toHaveBeenCalledWith(mockCreativeAd, '2.0');
      expect(initAd).toHaveBeenCalledTimes(1);
      expect(initAd).toHaveBeenCalledWith(mockCreativeAd, videoAdContainer, vpaidChain);
    });
  });
});
