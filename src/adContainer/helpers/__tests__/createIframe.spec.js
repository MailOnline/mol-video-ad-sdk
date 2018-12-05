import createIframe from '../createIframe';
import supportsSrcdoc from '../supportsSrcdoc';

jest.mock('../supportsSrcdoc');
describe('createIframe', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-undef
    jsdom.reconfigure({
      url: 'https://www.example.com/'
    });

    supportsSrcdoc.mockReturnValue(false);
  });

  test('must return an empty Iframe element', async () => {
    const iframe = await createIframe(document.body, 'test');

    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    expect(iframe).toMatchSnapshot();

    iframe.parentElement.removeChild(iframe);
  });

  test('must post a message to notify that is ready', async () => {
    expect.assertions(1);
    const handleMessage = ({data}) => {
      expect(data).toBe('test_iframe_ready');
    };

    window.addEventListener('message', handleMessage, false);
    await createIframe(document.body, 'test_iframe');
  });

  test('must throw (reject) if there is a problem creating the iframe', async () => {
    expect.assertions(1);
    try {
      await createIframe(document.createElement('div'), test);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
