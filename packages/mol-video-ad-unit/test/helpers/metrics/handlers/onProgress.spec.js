import {linearEvents} from 'mol-video-ad-tracker';
import onProgress from '../../../../src/helpers/metrics/handlers/onProgress';

const {progress} = linearEvents;
let videoElement;

beforeEach(() => {
  videoElement = document.createElement('VIDEO');
  Object.defineProperty(videoElement, 'duration', {
    value: 200,
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
    contentplayhead: '00:00:10.000',
    playedMs: 10000,
    playedPercentage: 5
  }));
  callback.mockClear();

  videoElement.currentTime = 10;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    contentplayhead: '00:00:20.000',
    playedMs: 20000,
    playedPercentage: 10
  }));
  callback.mockClear();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    contentplayhead: '00:02:00.000',
    playedMs: 120000,
    playedPercentage: 60
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
