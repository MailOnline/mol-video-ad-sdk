import onResize from '../../src/helpers/onResize';

jest.mock('lodash/debounce', () => (fn) => fn);

test('onResize must be a function', () => {
  expect(onResize).toEqual(expect.any(Function));
});

test('onResize must complain if we dont pass a callback fn', () => {
  expect(onResize).toThrow(TypeError);
});

test('must call the callback on resize', () => {
  const mock = jest.fn();
  const disconnect = onResize(() => mock());

  expect(mock).not.toHaveBeenCalled();

  window.dispatchEvent(new Event('resize'));
  expect(mock).toHaveBeenCalledTimes(1);

  window.dispatchEvent(new Event('orientationchange'));
  expect(mock).toHaveBeenCalledTimes(2);

  disconnect();

  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new Event('orientationchange'));
  expect(mock).toHaveBeenCalledTimes(2);
});

