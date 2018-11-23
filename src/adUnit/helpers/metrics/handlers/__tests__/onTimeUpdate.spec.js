import {linearEvents} from '../../../../../tracker';
import onTimeUpdate from '../onTimeUpdate';
import {adProgress} from '../../../../adUnitEvents';

const {
  complete,
  firstQuartile,
  midpoint,
  start,
  thirdQuartile
} = linearEvents;

describe('onTimeUpdate', () => {
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

  test('must call the callback with start, firstQuartile, midpoint, thirdQuartile and complete at the right order', () => {
    const callback = jest.fn();
    const disconnect = onTimeUpdate({videoElement}, callback);

    videoElement.currentTime = 1;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(start);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 15;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 25;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(firstQuartile);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 35;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 50;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(midpoint);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 65;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 75;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(thirdQuartile);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 85;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 99;
    videoElement.dispatchEvent(new Event('timeupdate'));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(complete);
    expect(callback).toHaveBeenCalledWith(adProgress);
    callback.mockClear();

    videoElement.currentTime = 100;
    videoElement.dispatchEvent(new Event('timeupdate'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(adProgress);

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
  });

  test('must rely on the ended event as a fallback for the timeupdate event for the complete event', () => {
    const callback = jest.fn();
    const disconnect = onTimeUpdate({videoElement}, callback);

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

  test('must not not call the cb with`complete` if already called', () => {
    const callback = jest.fn();

    onTimeUpdate({videoElement}, callback);

    videoElement.currentTime = 1;
    videoElement.dispatchEvent(new Event('timeupdate'));
    videoElement.currentTime = 25;
    videoElement.dispatchEvent(new Event('timeupdate'));
    videoElement.currentTime = 50;
    videoElement.dispatchEvent(new Event('timeupdate'));
    videoElement.currentTime = 75;
    videoElement.dispatchEvent(new Event('timeupdate'));
    videoElement.currentTime = 99;
    videoElement.dispatchEvent(new Event('timeupdate'));
    callback.mockClear();

    videoElement.dispatchEvent(new Event('ended'));
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
