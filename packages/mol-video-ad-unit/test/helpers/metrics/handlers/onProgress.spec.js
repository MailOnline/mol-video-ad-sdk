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

test('onProgress must call the callback with uri of the event that fullfilled the offset', () => {
  const callback = jest.fn();
  const progressEvents = [
    {
      offset: 5000,
      uri: 'http://test.example.com/progress2'
    },
    {
      offset: 'invalid offset',
      uri: 'http://test.example.com/progress3'
    },
    {
      offset: 10000
    },
    {
      offset: '10%',
      uri: 'http://test.example.com/progress1'
    },
    {
      offset: '50%',
      uri: 'http://test.example.com/progress4'
    }
  ];
  const disconnect = onProgress({videoElement}, callback, {progressEvents});

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    contentplayhead: '00:00:05.000',
    progressUri: progressEvents[0].uri
  }));
  callback.mockClear();

  videoElement.currentTime = 10;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();

  videoElement.currentTime = 20;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    contentplayhead: '00:00:20.000',
    progressUri: progressEvents[3].uri
  }));
  callback.mockClear();

  disconnect();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();

  videoElement.currentTime = videoElement.duration;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();
});

test('onProgress must not call the callback if all the events have been called', () => {
  const callback = jest.fn();
  const progressEvents = [
    {
      offset: 5000,
      uri: 'http://test.example.com/progress2'
    },
    {
      offset: 10000
    }
  ];

  onProgress({videoElement}, callback, {progressEvents});

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(progress, expect.objectContaining({
    contentplayhead: '00:00:05.000',
    progressUri: progressEvents[0].uri
  }));
  callback.mockClear();

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();

  videoElement.currentTime = videoElement.duration;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();
});

test('onProgress must do nothing if you don\'t pass progress events', () => {
  const callback = jest.fn();

  onProgress({videoElement}, callback);

  videoElement.currentTime = 100;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();

  videoElement.currentTime = videoElement.duration;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  callback.mockClear();
});

