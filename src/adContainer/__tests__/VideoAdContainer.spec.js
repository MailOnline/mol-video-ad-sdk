import VideoAdContainer from '../VideoAdContainer';
import loadScript from '../helpers/loadScript';
import getContentDocument from '../helpers/getContentDocument';
import supportsSrcdoc from '../helpers/supportsSrcdoc';

let placeholder;

jest.mock('../helpers/supportsSrcdoc');
jest.mock('../helpers/loadScript.js');

describe('VideoAdContainer', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-undef
    jsdom.reconfigure({
      url: 'https://www.example.com/'
    });
    placeholder = document.createElement('DIV');
    document.body.appendChild(placeholder);
    supportsSrcdoc.mockReturnValue(false);
  });

  afterEach(() => {
    document.body.removeChild(placeholder);
  });

  test('must complain if you don\'t pass a placeholder element', () => {
    expect(() => new VideoAdContainer()).toThrowError(TypeError);
  });

  test('must use the passed videoElement', () => {
    const videoElement = document.createElement('VIDEO');

    const videoAdContainer = new VideoAdContainer(placeholder, videoElement);

    expect(videoAdContainer.videoElement).toBe(videoElement);
  });

  test('must add the adContainer to the passed placeholder element', () => {
    const videoAdContainer = new VideoAdContainer(placeholder);
    const adContainerElement = videoAdContainer.element;

    expect(adContainerElement.parentNode).toBe(placeholder);
    expect(adContainerElement.classList.contains('mol-video-ad-container')).toBe(true);
    expect(adContainerElement.style.width).toBe('100%');
    expect(adContainerElement.style.height).toBe('100%');
  });

  test('if video element is not passed, it must create a video element and add it to the ad container', () => {
    const videoAdContainer = new VideoAdContainer(placeholder);
    const adContainerElement = videoAdContainer.element;

    expect(videoAdContainer.videoElement).toBeInstanceOf(Element);
    expect(videoAdContainer.videoElement.tagName).toBe('VIDEO');
    expect(videoAdContainer.videoElement.style.width).toBe('100%');
    expect(videoAdContainer.videoElement.style.height).toBe('100%');
    expect(videoAdContainer.videoElement.parentNode).toBe(adContainerElement);
  });

  describe('addScript', () => {
    test('must create an iframe and add the scripts to it', async () => {
      loadScript.mockReturnValue(Promise.resolve('SCRIPT_MOCK'));

      const src = 'http://example.com/resource';
      const scriptOpts = {foo: 'bar'};
      const videoAdContainer = new VideoAdContainer(placeholder);

      const adContainerElement = videoAdContainer.element;

      expect(adContainerElement.querySelector('IFRAME')).toBeNull();
      const script = await videoAdContainer.addScript(src, scriptOpts);
      const iframe = adContainerElement.querySelector('IFRAME');
      const iframeBody = getContentDocument(iframe).body;

      expect(script).toBe('SCRIPT_MOCK');

      expect(iframe).toBeInstanceOf(HTMLIFrameElement);
      expect(loadScript).toHaveBeenCalledTimes(1);
      expect(loadScript).toBeCalledWith(src, expect.objectContaining({
        placeholder: iframeBody,
        ...scriptOpts
      }));
    });

    test('must reuse the iframe to add scripts', async () => {
      loadScript.mockReturnValue(Promise.resolve('SCRIPT_MOCK'));

      const src = 'http://example.com/resource';
      const videoAdContainer = new VideoAdContainer(placeholder);

      const adContainerElement = videoAdContainer.element;

      expect(adContainerElement.querySelector('IFRAME')).toBeNull();
      await videoAdContainer.addScript(src);
      await videoAdContainer.addScript(src);
      await videoAdContainer.addScript(src);

      expect(adContainerElement.querySelectorAll('IFRAME').length).toBe(1);
    });

    test('must set the execution context', async () => {
      loadScript.mockReturnValue(Promise.resolve('SCRIPT_MOCK'));

      const src = 'http://example.com/resource';
      const videoAdContainer = new VideoAdContainer(placeholder);

      expect(videoAdContainer.executionContext).toBeNull();

      const adContainerElement = videoAdContainer.element;

      await videoAdContainer.addScript(src);

      const iframe = adContainerElement.querySelector('IFRAME');

      expect(videoAdContainer.executionContext).toBe(iframe.contentWindow);
    });
  });

  test('destroy must remove the adContainer from the placeHolder', () => {
    const videoAdContainer = new VideoAdContainer(placeholder);

    expect(videoAdContainer.element).toBeInstanceOf(Element);
    expect(videoAdContainer.videoElement).toBeInstanceOf(HTMLVideoElement);
    expect(placeholder.querySelector('.mol-video-ad-container')).toBe(videoAdContainer.element);

    videoAdContainer.destroy();

    expect(placeholder.querySelector('.mol-video-ad-container')).toBe(null);
    expect(videoAdContainer.element.parentNode).toBe(null);
  });

  test('once destroyed must not allow the addition of scripts', async () => {
    expect.assertions(1);
    const src = 'http://example.com/resource';
    const videoAdContainer = new VideoAdContainer(placeholder);

    videoAdContainer.destroy();

    try {
      await videoAdContainer.addScript(src, {});
    } catch (error) {
      expect(error.message).toBe('VideoAdContainer has been destroyed');
    }
  });

  test('isDestroy must return true if the ad container is destroyed and false otherwise', () => {
    const videoAdContainer = new VideoAdContainer(placeholder);

    expect(videoAdContainer.isDestroyed()).toBe(false);

    videoAdContainer.destroy();

    expect(videoAdContainer.isDestroyed()).toBe(true);
  });

  describe('isOriginalVideoElement', () => {
    test('must be true if the videoElement is passed', () => {
      expect.assertions(1);
      const videoAdContainer = new VideoAdContainer(placeholder);

      expect(videoAdContainer.isOriginalVideoElement).toBe(false);
    });

    test('must be false if the videoElement is created by the videoAdContainer', () => {
      expect.assertions(1);
      const videoAdContainer = new VideoAdContainer(placeholder, document.createElement('VIDEO'));

      expect(videoAdContainer.isOriginalVideoElement).toBe(true);
    });
  });
});
