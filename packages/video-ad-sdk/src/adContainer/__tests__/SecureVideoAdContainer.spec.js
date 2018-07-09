import SecureVideoAdContainer from '../SecureVideoAdContainer';
import VideoAdContainer from '../VideoAdContainer';

let placeholder;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  document.body.appendChild(placeholder);
});

afterEach(() => {
  document.body.removeChild(placeholder);
});

test('SecureVideoAdContainer must complain if you don\'t pass a placeholder element', () => {
  expect(() => new SecureVideoAdContainer()).toThrowError(TypeError);
});

test('SecureVideoAdContainer must be an instanceof VideoAdContainer', () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  expect(secureVideoAdContainer).toBeInstanceOf(VideoAdContainer);
});

test('SecureVideoAdContainer use the passed videoElement', async () => {
  const videoElement = document.createElement('VIDEO');

  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder, videoElement);

  await secureVideoAdContainer.ready();

  expect(secureVideoAdContainer.videoElement).toBe(videoElement);
});

test('SecureVideoAdContainer must add the adContainer to the passed placeholder element', () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);
  const adContainerElement = secureVideoAdContainer.element;

  expect(adContainerElement.parentNode).toBe(placeholder);
  expect(adContainerElement.classList.contains('mol-video-ad-container')).toBe(true);
  expect(adContainerElement.classList.contains('mol-secure-video-ad-container')).toBe(true);
  expect(adContainerElement.style.width).toBe('100%');
  expect(adContainerElement.style.height).toBe('100%');
});

test('SecureVideoAdContainer must create a video element and add it to the iframe within the adContainer', async () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();

  const adContainerElement = secureVideoAdContainer.element;
  const iframeElement = adContainerElement.querySelector('IFRAME');
  const iframeBodyElement = iframeElement.contentDocument.body;

  expect(secureVideoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(secureVideoAdContainer.videoElement.tagName).toBe('VIDEO');
  expect(secureVideoAdContainer.videoElement.style.width).toBe('100%');
  expect(secureVideoAdContainer.videoElement.style.height).toBe('100%');
  expect(secureVideoAdContainer.videoElement.parentNode).toBe(iframeBodyElement);
});

test('SecureVideoAdContainer must set the context to the iframe\'s window', async () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();

  const adContainerElement = secureVideoAdContainer.element;
  const iframeElement = adContainerElement.querySelector('IFRAME');

  expect(secureVideoAdContainer.context).toBe(iframeElement.contentWindow);
});

test('SecureVideoAdContainer must be possible to add scripts to the iframe\'s', async () => {
  const src = 'http://example.com/resource';
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();

  const adContainerElement = secureVideoAdContainer.element;
  const iframeElement = adContainerElement.querySelector('IFRAME');
  const iframeBodyElement = iframeElement.contentDocument.body;
  const promise = secureVideoAdContainer.addScript(src, {});
  const script = iframeBodyElement.querySelector('script');

  expect(script.parentNode).toBe(iframeBodyElement);
  expect(script.src).toBe(src);
  expect(script.defer).toBe(true);
  expect(script.async).toBe(false);

  script.onload();

  expect(promise).resolves.toBe(script);
});

test('SecureVideoAdContainer destroy must remove the adContainer from the placeHolder', async () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  expect(secureVideoAdContainer.element).toBeInstanceOf(Element);
  expect(secureVideoAdContainer.videoElement).toEqual(null);
  expect(secureVideoAdContainer.context).toEqual(null);
  expect(placeholder.querySelector('.mol-secure-video-ad-container')).toBe(secureVideoAdContainer.element);

  await secureVideoAdContainer.ready();

  const adContainerElement = secureVideoAdContainer.element;
  const iframeElement = adContainerElement.querySelector('IFRAME');

  expect(secureVideoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(secureVideoAdContainer.context).toBe(iframeElement.contentWindow);

  secureVideoAdContainer.destroy();

  expect(placeholder.querySelector('.mol-video-ad-container')).toBe(null);
});

test('SecureVideoAdContainer once destroyed must not allow the addition of scripts or resize', async () => {
  const src = 'http://example.com/resource';
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();

  secureVideoAdContainer.destroy();

  expect(() => secureVideoAdContainer.addScript(src, {})).toThrowError('SecureVideoAdContainer has been destroyed');
  expect(() => secureVideoAdContainer.resize()).toThrowError('SecureVideoAdContainer has been destroyed');
});

test('SecureVideoAdContainer isDestroy must return true if the ad container is destroyed and false otherwise', async () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();
  expect(secureVideoAdContainer.isDestroyed()).toBe(false);

  secureVideoAdContainer.destroy();

  expect(secureVideoAdContainer.isDestroyed()).toBe(true);
});

test('SecureVideoAdContainer resize must resize the iframe to the container\'s size', async () => {
  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  await secureVideoAdContainer.ready();

  const adContainerElement = secureVideoAdContainer.element;
  const iframeElement = adContainerElement.querySelector('IFRAME');

  expect(adContainerElement.clientWidth).toBe(0);
  expect(adContainerElement.clientHeight).toBe(0);
  expect(iframeElement.width).toBe('0px');
  expect(iframeElement.height).toBe('0px');

  Object.defineProperty(adContainerElement, 'clientWidth', {
    configurable: true,
    enumerable: true,
    get () {
      return 100;
    }
  });

  Object.defineProperty(adContainerElement, 'clientHeight', {
    configurable: true,
    enumerable: true,
    get () {
      return 100;
    }
  });

  secureVideoAdContainer.resize();

  expect(adContainerElement.clientWidth).toBe(100);
  expect(adContainerElement.clientHeight).toBe(100);
  expect(iframeElement.width).toBe('100px');
  expect(iframeElement.height).toBe('100px');
});

test('SecureVideoAdContainer must resize itself on iframe load', async () => {
  SecureVideoAdContainer.prototype.resize = jest.fn();

  const secureVideoAdContainer = new SecureVideoAdContainer(placeholder);

  expect(secureVideoAdContainer.resize).not.toHaveBeenCalled();

  await secureVideoAdContainer.ready();

  expect(secureVideoAdContainer.resize).toHaveBeenCalledTimes(1);
});
