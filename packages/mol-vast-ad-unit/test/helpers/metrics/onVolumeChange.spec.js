import onVolumeChange from '../../../src/helpers/metrics/onVolumeChange';
import {mute, unmute} from '../../../src/helpers/metrics/linearTrackingEvents';

test('onVolumechange must call the callback with mute if the video was unmute and it became mute and the other way around', () => {
  const callback = jest.fn();
  const videoElement = document.createElement('VIDEO');

  videoElement.muted = false;
  const disconnect = onVolumeChange(videoElement, callback);

  videoElement.muted = true;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(mute);

  callback.mockClear();
  videoElement.muted = false;
  videoElement.volume = 1;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(unmute);

  callback.mockClear();
  videoElement.muted = false;
  videoElement.volume = 0;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(mute);

  callback.mockClear();
  videoElement.muted = false;
  videoElement.volume = 0.5;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(unmute);

  disconnect();
  callback.mockClear();
  videoElement.muted = true;
  videoElement.volume = 0;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(0);
});
