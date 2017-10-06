import onImpression from '../../../src/helpers/metrics/onImpression';
import {
  impression
} from '../../../src/helpers/metrics/linearTrackingEvents';

let videoElement;

beforeEach(() => {
  videoElement = document.createElement('VIDEO');
  Object.defineProperty(videoElement, 'duration', {
    value: 100,
    writable: true
  });
  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  });
});

afterEach(() => {
  videoElement = null;
});

test('onImpression must call the callback with impression when there is a impression of the current video', () => {
  const callback = jest.fn();
  const disconnect = onImpression({videoElement}, callback);

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  videoElement.currentTime = 1.5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  videoElement.currentTime = 2;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(impression);
  callback.mockClear();

  videoElement.currentTime = 2.5;
  videoElement.dispatchEvent(new Event('timeupdate'));

  videoElement.currentTime = 3;
  videoElement.dispatchEvent(new Event('timeupdate'));

  videoElement.currentTime = 3.5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  disconnect();

  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 10;

  expect(callback).toHaveBeenCalledTimes(0);
});
