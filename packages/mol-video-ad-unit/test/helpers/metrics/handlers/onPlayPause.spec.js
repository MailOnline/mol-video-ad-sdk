import {linearEvents} from '@mol/video-ad-tracker';
import onPlayPause from '../../../../src/helpers/metrics/handlers/onPlayPause';

const {pause, resume} = linearEvents;

test('onPlayPause must call the callback with start at the video start with pause when paused and with resume then the video gets resumed', () => {
  const callback = jest.fn();
  const videoElement = document.createElement('VIDEO');
  const disconnect = onPlayPause({videoElement}, callback);

  videoElement.dispatchEvent(new Event('play'));
  expect(callback).toHaveBeenCalledTimes(0);

  callback.mockClear();
  videoElement.dispatchEvent(new Event('play'));
  expect(callback).toHaveBeenCalledTimes(0);
  videoElement.dispatchEvent(new Event('pause'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(pause);

  callback.mockClear();
  videoElement.dispatchEvent(new Event('pause'));
  expect(callback).toHaveBeenCalledTimes(0);
  videoElement.dispatchEvent(new Event('play'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(resume);

  disconnect();
  callback.mockClear();
  videoElement.dispatchEvent(new Event('pause'));
  videoElement.dispatchEvent(new Event('play'));
  expect(callback).toHaveBeenCalledTimes(0);
});
