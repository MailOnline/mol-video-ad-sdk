import {linearEvents} from '../../../../../tracker';
import {volumeChanged} from '../../../../adUnitEvents';
import onVolumeChange from '../onVolumeChange';

const {
  mute,
  unmute
} = linearEvents;

test('onVolumechange must call the callback with mute if the video was unmute and it became mute and the other way around', () => {
  const callback = jest.fn();
  const videoElement = document.createElement('VIDEO');

  videoElement.muted = false;
  const disconnect = onVolumeChange({videoElement}, callback);

  videoElement.muted = true;

  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(volumeChanged);
  expect(callback).toHaveBeenCalledWith(mute);

  callback.mockClear();
  videoElement.muted = false;

  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(volumeChanged);
  expect(callback).toHaveBeenCalledWith(unmute);

  callback.mockClear();
  videoElement.volume = 0.6;
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(volumeChanged);

  callback.mockClear();
  videoElement.volume = 0;
  videoElement.muted = false;

  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(volumeChanged);
  expect(callback).toHaveBeenCalledWith(mute);

  callback.mockClear();
  videoElement.muted = false;
  videoElement.volume = 0.5;

  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(volumeChanged);
  expect(callback).toHaveBeenCalledWith(unmute);

  disconnect();
  callback.mockClear();
  videoElement.muted = true;
  videoElement.volume = 0;
  videoElement.dispatchEvent(new Event('volumechange'));
  expect(callback).toHaveBeenCalledTimes(0);
});
