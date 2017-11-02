import {linearEvents} from 'mol-video-ad-tracker';
import onFullscreenChange from '../../../../src/helpers/metrics/handlers/onFullscreenChange';

const {
  playerCollapse,
  playerExpand
} = linearEvents;

test('onFullscreenChange must call playerExpand on when going fullscreen and playerCollapse when when leaving fullscreen', () => {
  const callback = jest.fn();
  const disconnect = onFullscreenChange({context: window}, callback);

  document.fullscreenElement = document.createElement('VIDEO');
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(playerExpand);

  callback.mockClear();
  document.fullscreenElement = null;
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(playerCollapse);

  disconnect();
  callback.mockClear();
  document.fullscreenElement = document.createElement('VIDEO');
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(callback).not.toHaveBeenCalled();

  delete document.fullscreenElement;
});
