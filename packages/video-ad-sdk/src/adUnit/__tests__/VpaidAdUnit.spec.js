import {
  vastInlineXML,
  inlineParsedXML,
  inlineAd,
  vpaidInlineAd,
  vpaidInlineParsedXML,
  vastVpaidInlineXML
} from '../../../fixtures';
import VideoAdContainer from '../../adContainer/VideoAdContainer';
import init from '../helpers/vpaid/init';
import VpaidAdUnit from '../VpaidAdUnit';

jest.mock('../helpers/vpaid/init');

describe('VpaidAdUnit', () => {
  let vastChain;
  let vpaidChain;
  let videoAdContainer;

  beforeEach(async () => {
    vastChain = [
      {
        ad: inlineAd,
        errorCode: null,
        parsedXML: inlineParsedXML,
        requestTag: 'https://test.example.com/vastadtaguri',
        XML: vastInlineXML
      }
    ];

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

  test('must throw if the vast chain has not suppoerted vpaidCreative', () => {
    expect.assertions(2);
    try {
      // eslint-disable-next-line no-new
      new VpaidAdUnit(vastChain, videoAdContainer);
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe('VastChain does not contain a supported vpaid creative');
    }
  });

  test('must init the creative', () => {
    // eslint-disable-next-line no-new
    new VpaidAdUnit(vpaidChain, videoAdContainer);

    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        apiFramework: 'VPAID',
        src: 'https://test.example.com/html5.js',
        type: 'text/javascript'
      }),
      videoAdContainer);
  });

  // describe('start', () => {
  //   test('must throw if started');
  //   test('must throw if finished');
  // });
});
