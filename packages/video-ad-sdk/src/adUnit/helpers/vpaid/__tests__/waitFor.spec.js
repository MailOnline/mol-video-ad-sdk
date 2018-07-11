/* eslint-disable global-require, import/unambiguous */
import MockVpaidCreativeAd from '../../../__tests__/MockVpaidCreativeAd';

jest.useFakeTimers();

describe('waitFor', () => {
  test('must resolve once the event is fired', async () => {
    const waitFor = require('../waitFor').default;
    const creativeAd = new MockVpaidCreativeAd();
    const callback = jest.fn();

    const promise = waitFor(creativeAd, 'adLoaded', 1000);

    // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
    promise.then(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);

    creativeAd.emit('adLoaded');

    await promise;

    expect(clearTimeout).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('must reject with an error if it times out', async () => {
    const waitFor = require('../waitFor').default;
    const creativeAd = new MockVpaidCreativeAd();
    const callback = jest.fn();

    const promise = waitFor(creativeAd, 'adLoaded', 2000);

    // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
    promise.then(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);

    jest.runOnlyPendingTimers();

    try {
      await promise;
    } catch (error) {
      expect(error.message).toBe('Timeout waiting for event \'adLoaded\'');
      expect(callback).not.toHaveBeenCalled();
    }
  });

  test('must not call setTimeot if no time is passed', async () => {
    setTimeout.mockClear();
    clearTimeout.mockClear();
    const waitFor = require('../waitFor').default;
    const creativeAd = new MockVpaidCreativeAd();
    const callback = jest.fn();
    const promise = waitFor(creativeAd, 'adLoaded');

    // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
    promise.then(callback);

    expect(setTimeout).not.toHaveBeenCalled();

    creativeAd.emit('adLoaded');

    await promise;

    expect(clearTimeout).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
