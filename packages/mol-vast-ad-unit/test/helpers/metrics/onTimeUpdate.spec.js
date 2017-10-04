import onTimeUpdate from '../../../src/helpers/metrics/onTimeUpdate';
import {
  complete,
  firstQuartile,
  midpoint,

  // progress,
  start,
  thirdQuartile

  // timeSpentViewing
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

test('onTimeUpdate must call the callback with start, firstQuartile, midpoint, thirdQuartile and complete at the right order', () => {
  const callback = jest.fn();
  const disconnect = onTimeUpdate(videoElement, callback);

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(start);
  callback.mockClear();

  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(firstQuartile);
  callback.mockClear();

  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(midpoint);
  callback.mockClear();

  videoElement.currentTime = 75;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(thirdQuartile);
  callback.mockClear();

  videoElement.currentTime = 99;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(complete);
  callback.mockClear();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  disconnect();

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 75;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));

  expect(callback).toHaveBeenCalledTimes(0);
});

test('onTimeUpdate must rely on the ended event as a fallback for the timeupdate event for the complete event', () => {
  const callback = jest.fn();
  const disconnect = onTimeUpdate(videoElement, callback);

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 75;
  videoElement.dispatchEvent(new Event('timeupdate'));
  callback.mockClear();

  videoElement.currentTime = 99;
  videoElement.dispatchEvent(new Event('ended'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(complete);
  callback.mockClear();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();

  disconnect();
  videoElement.dispatchEvent(new Event('ended'));
  expect(callback).toHaveBeenCalledTimes(0);
});
