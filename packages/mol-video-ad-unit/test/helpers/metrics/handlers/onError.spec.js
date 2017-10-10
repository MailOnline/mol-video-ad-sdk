import onError from '../../../../src/helpers/metrics/handlers/onError';
import {
  error
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

test('onError must call the callback with rewind when there is an error on the current video', () => {
  const callback = jest.fn();
  const disconnect = onError({videoElement}, callback);

  expect(callback).toHaveBeenCalledTimes(0);
  videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenLastCalledWith(error);
  callback.mockClear();

  disconnect();

  videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(0);
});
