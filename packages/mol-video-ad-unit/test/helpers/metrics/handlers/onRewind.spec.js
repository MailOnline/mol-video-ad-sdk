import {linearEvents} from 'mol-video-ad-tracker';
import onRewind from '../../../../src/helpers/metrics/handlers/onRewind';

const {rewind} = linearEvents;
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

test('onRewind must call the callback with rewind when there is a rewind of the current video', () => {
  const callback = jest.fn();
  const disconnect = onRewind({videoElement}, callback);

  videoElement.currentTime = 10;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  videoElement.currentTime = 24.5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  videoElement.currentTime = 15;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(rewind);
  callback.mockClear();

  disconnect();

  videoElement.currentTime = 50;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 25;
  videoElement.dispatchEvent(new Event('timeupdate'));
  videoElement.currentTime = 10;

  expect(callback).toHaveBeenCalledTimes(0);
});
