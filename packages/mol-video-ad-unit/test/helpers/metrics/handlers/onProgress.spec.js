import onProgress from '../../../../src/helpers/metrics/handlers/onProgress';
import {
  progress
} from '../../../../src/helpers/metrics/linearTrackingEvents';

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

test('onProgress call the callback with the progress', () => {
  const callback = jest.fn();
  const disconnect = onProgress({videoElement}, callback);

  videoElement.currentTime = 10;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    accumulated: 10000,
    contentplayhead: '00:00:10.000'
  }));
  callback.mockClear();

  videoElement.currentTime = 10;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    accumulated: 20000,
    contentplayhead: '00:00:20.000'
  }));
  callback.mockClear();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    accumulated: 120000,
    contentplayhead: '00:02:00.000'
  }));
  callback.mockClear();

  disconnect();

  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 10;

  expect(callback).toHaveBeenCalledTimes(0);
});
