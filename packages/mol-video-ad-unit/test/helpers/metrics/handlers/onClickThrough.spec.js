import {createVideoAdContainer} from 'mol-video-ad-container';
import onClickThrough from '../../../../src/helpers/metrics/handlers/onClickThrough';
import {clickThrough} from '../../../../src/helpers/metrics/linearTrackingEvents';

let videoAdContainer;
let callback;

beforeEach(async () => {
  callback = jest.fn();
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  const {videoElement} = videoAdContainer;

  Object.defineProperty(videoElement, 'play', {
    value: jest.fn(),
    writable: true
  });

  Object.defineProperty(videoElement, 'pause', {
    value: jest.fn(),
    writable: true
  });

  Object.defineProperty(videoElement, 'paused', {
    value: true,
    writable: true
  });
});

afterEach(() => {
  callback = null;
  videoAdContainer = null;
});

test('onClickThrough must add an anchor to the videoAdContainer element', () => {
  const {element} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  expect(anchor).toBeInstanceOf(HTMLAnchorElement);
  expect(anchor.href).toBe('');
  expect(anchor.style.width).toEqual('100%');
  expect(anchor.style.height).toEqual('100%');
  expect(anchor.style.position).toEqual('absolute');
  expect(anchor.style.zIndex).toEqual('9999');
});

test('onClickThrough must on anchor click, pause the video content and call the callback with clickthrough', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = false;
  anchor.click();

  expect(videoElement.pause).toHaveBeenCalledTimes(1);
  expect(videoElement.play).not.toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(clickThrough);
});

test('onClickThrough must on anchor second click, play the video and not call the callback', () => {
  const {element, videoElement} = videoAdContainer;

  onClickThrough(videoAdContainer, callback);

  const anchor = element.querySelector('a.mol-vast-clickthrough');

  videoElement.paused = true;
  anchor.click();

  expect(videoElement.play).toHaveBeenCalledTimes(1);
  expect(videoElement.pause).not.toHaveBeenCalled();
  expect(callback).not.toHaveBeenCalled();
});

test('onClickThrough must remove the anchor on disconnect', () => {
  const {element} = videoAdContainer;

  const disconnect = onClickThrough(videoAdContainer, callback);

  disconnect();

  expect(element.querySelector('a.mol-vast-clickthrough')).toEqual(null);
});
