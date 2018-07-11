import createVideoAdContainer from '../../../../adContainer/createVideoAdContainer';
import init from '../init';
import loadCreative from '../loadCreative';
import handshake from '../handshake';

jest.mock('../loadCreative');
jest.mock('../handshake');

describe('init', () => {
  let videoAdContainer;

  beforeEach(async () => {
    videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  });

  test('must init the creative and return it', async () => {
    const mockCreative = {
      src: 'https://test.example.com/vpaid/creative.js',
      type: 'text/javascript'
    };
    const mockCreativeAd = {handshakeVersion: () => '1.1'};

    loadCreative.mockReturnValue(Promise.resolve(mockCreativeAd));
    const creativeAd = await init(mockCreative, videoAdContainer);

    expect(creativeAd).toBe(mockCreativeAd);
    expect(loadCreative).toHaveBeenCalledTimes(1);
    expect(loadCreative).toHaveBeenCalledWith(mockCreative, videoAdContainer);
    expect(handshake).toHaveBeenCalledTimes(1);
    expect(handshake).toHaveBeenCalledWith(mockCreativeAd, '2.0');
  });
});
