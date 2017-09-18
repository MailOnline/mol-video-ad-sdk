import VideoAdContainer from '../src/VideoAdContainer';

test('VideoAdContainer must complain if you don\'t pass a placeholder element', () => {
  expect(() => new VideoAdContainer()).toThrowError(TypeError);
});

test('VideoAdContainer must add the adContainer to the passed placeholder element', () => {
  const placeholder = document.createElement('DIV');
  const videoAdContainer = new VideoAdContainer(placeholder);
  const adContainerElement = videoAdContainer.element;

  expect(adContainerElement.parentNode).toBe(placeholder);
  expect(adContainerElement.style.width).toBe('100%');
  expect(adContainerElement.style.height).toBe('100%');
});

test('VideoAdContainer must use the provided video element', () => {
  const placeholder = document.createElement('DIV');
  const videoElement = document.createElement('VIDEO');
  const videoAdContainer = new VideoAdContainer(placeholder, {videoElement});

  expect(videoAdContainer.videoElement).toBe(videoElement);
});

test('VideoAdContainer if video element is not passed, it must create a video element and addit to the adContainer', () => {
  const placeholder = document.createElement('DIV');
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(videoAdContainer.videoElement.tagName).toBe('VIDEO');
  expect(videoAdContainer.videoElement.style.width).toBe('100%');
  expect(videoAdContainer.videoElement.style.height).toBe('100%');
  expect(videoAdContainer.videoElement.parentNode).toBe(videoAdContainer.element);
});

test('VideoAdContainer must be possible to add scripts to the adContainer', () => {
  const placeholder = document.createElement('DIV');
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

test('VideoAdContiner remove must remove the adContainer from the placeHolder and set the element reference to null', () => {
  const placeholder = document.createElement('DIV');
  const videoAdContainer = new VideoAdContainer(placeholder);

  expect(videoAdContainer.element).toBeInstanceOf(Element);
  expect(videoAdContainer.videoElement).toBeInstanceOf(Element);
  expect(placeholder.querySelector('.mol-video-ad-container')).toBe(videoAdContainer.element);

  videoAdContainer.destroy();

  expect(videoAdContainer.element).toBe(null);
  expect(videoAdContainer.videoElement).toBe(null);
  expect(placeholder.querySelector('.mol-video-ad-container')).toBe(null);
});

test('VideoAdContainer once removed must not allow the addition of scripts and must set the adContainer and videoElement to null', () => {
  const placeholder = document.createElement('DIV');
  const videoAdContainer = new VideoAdContainer(placeholder);
  const src = 'http://example.com/resource';

  videoAdContainer.destroy();

  expect(() => videoAdContainer.addScript(src, {})).toThrowError('videoAdContainer has been destroyed');
});
