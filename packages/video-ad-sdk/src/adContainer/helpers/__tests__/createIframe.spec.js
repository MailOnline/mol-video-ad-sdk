import createIframe from '../createIframe';

// TODO: enable this test once jsdom supports srcdoc see for more info https://github.com/jsdom/jsdom/pull/2389
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('createIframe', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-undef
    jsdom.reconfigure({
      url: 'https://www.example.com/'
    });
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
      expect(error.message).toBe('Error creating iframe, the placeholder is probably not in the DOM');
    }
  });
});
