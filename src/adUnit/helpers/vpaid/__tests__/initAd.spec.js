import {
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../../../fixtures';
import VideoAdContainer from '../../../../adContainer/VideoAdContainer';
import initAd from '../initAd';
import MockVpaidCreativeAd from '../../../__tests__/MockVpaidCreativeAd';

jest.mock('../loadCreative');
jest.mock('../handshake');

describe('initAd', () => {
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

  test('must init the creative', async () => {
    const mockCreativeAd = new MockVpaidCreativeAd();

    await initAd(mockCreativeAd, videoAdContainer, vpaidChain);

    expect(mockCreativeAd.initAd).toHaveBeenCalledTimes(1);
    expect(mockCreativeAd.initAd).toHaveBeenCalledWith(
      0,
      0,
      'thumbnail',
      -1,
      {
        AdParameters: 'AD_PARAMETERS_DATA',
        xmlEncoded: false
      },
      {
        slot: expect.any(HTMLDivElement),
        videoSlot: videoAdContainer.videoElement,
        videoSlotCanAutoPlay: false
      }
    );

    const {slot} = mockCreativeAd.initAd.mock.calls[0][5];

    expect(slot).toBeInstanceOf(HTMLDivElement);
    expect(slot.style).toEqual(expect.objectContaining({
      border: '0px',
      cursor: 'pointer',
      height: '0px',
      left: '0px',
      margin: '0px',
      padding: '0px',
      position: 'absolute',
      top: '0px',
      width: '0px'
    }));
  });
});
