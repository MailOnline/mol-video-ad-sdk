import loadCreative from '../loadCreative';
import createVideoAdContainer from '../../../../adContainer/createVideoAdContainer';

describe('loadCreative', () => {
  let videoAdContainer;

  beforeEach(async () => {
    videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  });

  test('must load the creative and return it', async () => {
    const mockVpaidCreative = {
      name: 'VPAID_CREATIVE_MOCK'
    };

    videoAdContainer.addScript = jest.fn();
    videoAdContainer.addScript.mockReturnValue(Promise.resolve('success'));
    videoAdContainer.executionContext = {
      getVPAIDAd: () => mockVpaidCreative
    };

    const creative = await loadCreative({
      src: 'https://test.example.com/vpaid/creative.js',
      type: 'text/javascript'
    }, videoAdContainer);

    expect(creative).toBe(mockVpaidCreative);
    expect(videoAdContainer.addScript).toHaveBeenCalledTimes(1);
    expect(videoAdContainer.addScript).toHaveBeenCalledWith('https://test.example.com/vpaid/creative.js', {type: 'text/javascript'});
  });
});
