import {onElementResize} from 'mol-element-observers';
import VideoAdContainer from '../src/VideoAdContainer';

jest.mock('mol-element-observers', () => ({
  onElementResize: jest.fn()
}));

let placeholder;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  document.body.appendChild(placeholder);
});

afterEach(() => {
  document.body.removeChild(placeholder);
  onElementResize.mockClear();
});

test('VideoAdContainer must complain if you don\'t pass a placeholder element', () => {
  expect(() => new VideoAdContainer()).toThrowError(TypeError);
});

test('VideoAdContainer must add the adContainer to the passed placeholder element', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);
  const adContainerElement = videoAdContainer.element;

  expect(adContainerElement.parentNode).toBe(placeholder);
  expect(adContainerElement.style.width).toBe('100%');
  expect(adContainerElement.style.height).toBe('100%');
});

test('VideoAdContainer must use the provided video element', () => {
  const videoElement = document.createElement('VIDEO');
  const videoAdContainer = new VideoAdContainer(placeholder, {videoElement});

  expect(videoAdContainer.videoElement).toBe(videoElement);
  expect(videoElement.parentNode).not.toBe(videoAdContainer.element);
});

test('VideoAdContainer if video element is not passed, it must create a video element and addit to the adContainer', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(videoAdContainer.videoElement.tagName).toBe('VIDEO');
  expect(videoAdContainer.videoElement.style.width).toBe('100%');
  expect(videoAdContainer.videoElement.style.height).toBe('100%');
  expect(videoAdContainer.videoElement.parentNode).toBe(videoAdContainer.element);
});

test('VideoAdContainer must set the context to window', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.context).toBe(window);
});

test('VideoAdContainer ready method must resolve with itself', async () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(await videoAdContainer.ready()).toBe(videoAdContainer);
});

test('VideoAdContainer must be possible to add scripts to the adContainer', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);
  const src = 'http://example.com/resource';

  const promise = videoAdContainer.addScript(src, {});
  const script = videoAdContainer.element.querySelector('script');

  expect(script.parentNode).toBe(videoAdContainer.element);
  expect(script.src).toBe(src);
  expect(script.defer).toBe(true);
  expect(script.async).toBe(false);

  script.onload();

  expect(promise).resolves.toBe(script);
});

test('VideoAdContainer destroy must remove the adContainer from the placeHolder and set the element reference to null', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.element).toBeInstanceOf(Element);
  expect(videoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(placeholder.querySelector('.mol-video-ad-container')).toBe(videoAdContainer.element);

  videoAdContainer.destroy();

  expect(videoAdContainer.element).toBe(null);
  expect(videoAdContainer.videoElement).toBe(null);
  expect(placeholder.querySelector('.mol-video-ad-container')).toBe(null);
});

test('VideoAdContainer once destroyed must not allow the addition of scripts and must set the adContainer and videoElement to null', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);
  const src = 'http://example.com/resource';

  videoAdContainer.destroy();

  expect(() => videoAdContainer.addScript(src, {})).toThrowError('VideoAdContainer has been destroyed');
  expect(() => videoAdContainer.resize()).toThrowError('VideoAdContainer has been destroyed');
});

test('VideoAdContainer isDestroy must return true if the ad container is destroyed and false otherwise', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.isDestroyed()).toBe(false);
  videoAdContainer.destroy();
  expect(videoAdContainer.isDestroyed()).toBe(true);
});

test('VideoAdContainer resize must do nothing', () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(() => videoAdContainer.resize()).not.toThrowError();
});

test('VideoAdContainer onResize must call the callback whenever the element resizes', async () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  await videoAdContainer.ready();

  const adContainerElement = videoAdContainer.element;
  const callback = jest.fn();

  videoAdContainer.onResize(callback);

  expect(onElementResize).toHaveBeenCalledWith(adContainerElement, expect.any(Function));

  const onResizeHandler = onElementResize.mock.calls[0][1];

  expect(callback).not.toHaveBeenCalled();
  onResizeHandler();
  expect(callback).toHaveBeenCalled();
  onResizeHandler();
  expect(callback).toHaveBeenCalledTimes(2);
});

test('videoAdContainer onResize must return a stop function', async () => {
  const videoAdContainer = new VideoAdContainer(placeholder);

  await videoAdContainer.ready();

  const adContainerElement = videoAdContainer.element;
  const callback = jest.fn();

  const stopListening = videoAdContainer.onResize(callback);

  expect(onElementResize).toHaveBeenCalledWith(adContainerElement, expect.any(Function));

  const onResizeHandler = onElementResize.mock.calls[0][1];

  expect(callback).not.toHaveBeenCalled();
  onResizeHandler();
  expect(callback).toHaveBeenCalled();

  stopListening();

  onResizeHandler();
  expect(callback).toHaveBeenCalledTimes(1);
});
