import {linearEvents} from 'mol-video-ad-tracker';
import onError from '../../../../src/helpers/metrics/handlers/onError';

const {error} = linearEvents;
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
  Object.defineProperty(videoElement, 'error', {
    value: undefined,
    writable: true
  });
});

afterEach(() => {
  videoElement = null;
});

test('onError must call the callback with rewind when there is an error on the current video', () => {
  const callback = jest.fn();
  const disconnect = onError({videoElement}, callback);
  const mockVideoError = new Error('mockVideoError');

  videoElement.error = mockVideoError;

  expect(callback).toHaveBeenCalledTimes(0);
  videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenLastCalledWith(error, mockVideoError);
  callback.mockClear();

  disconnect();

  videoElement.dispatchEvent(new Event('error'));
  expect(callback).toHaveBeenCalledTimes(0);
});
