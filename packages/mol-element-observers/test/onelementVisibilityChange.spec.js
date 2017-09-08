import onElementVisibilityChange from '../src/onElementVisibilityChange';

const once = (context, eventName, listener) => {
  const handler = (...args) => {
    context.removeEmentListener(eventName, handler);
    listener(...args);
  };

  context.addEventListener(eventName, listener);
};

const waitForEvent = (eventName, context = window) => new Promise((resolve) => {
  once(context, eventName, resolve);
});

let mockIsElementVisibleValue = true;

jest.mock('lodash/debounce', () => (fn) => fn);
jest.mock('../src/helpers/isElementVisible', () => () => mockIsElementVisibleValue);

test('onElementVisibilityChange must be a function', () => {
  expect(onElementVisibilityChange).toEqual(expect.any(Function));
});

test('onElementVisibilityChange must complain if the passed target is not an Element', () => {
  expect(onElementVisibilityChange).toThrow(TypeError);
});

test('onElementVisibilityChange mut complain if you don\'t pass a callback function', () => {
  expect(() => onElementVisibilityChange(document.createElement('DIV'))).toThrow(TypeError);
});

test('onElementVisibilityChange must call callback if the element is visible', () => {
  const target = global.document.createElement('DIV');
  const mock = jest.fn();

  const disconnect = onElementVisibilityChange(target, (...args) => mock(...args));

  expect(mock).toHaveBeenCalledWith(true);

  disconnect();
});

[
  {eventName: 'resize'},
  {eventName: 'orientationchange'},
  {eventName: 'scroll'},
  {
    context: document,
    eventName: 'visibilitychange'
  }
].forEach(({eventName, context = window}) => {
  test(`onElementVisibilityChange must call callback with true if the element becomes visible on ${eventName}`, async () => {
    expect.assertions(2);
    const target = document.createElement('DIV');
    const mock = jest.fn();

    mockIsElementVisibleValue = false;

    const disconnect = onElementVisibilityChange(target, (...args) => mock(...args));

    expect(mock).not.toHaveBeenCalled();

    const waitPromise = waitForEvent(eventName, context);

    mockIsElementVisibleValue = true;

    context.dispatchEvent(new Event(eventName));

    await waitPromise;

    expect(mock).toHaveBeenCalledWith(true);

    disconnect();
  });

  test(`onElementVisibilityChange must call callback with false if the element becomes hidden on ${eventName}`, async () => {
    expect.assertions(2);
    const target = document.createElement('DIV');
    const mock = jest.fn();

    mockIsElementVisibleValue = true;

    const disconnect = onElementVisibilityChange(target, (...args) => mock(...args));

    expect(mock).toHaveBeenCalledWith(true);

    const waitPromise = waitForEvent(eventName, context);

    mockIsElementVisibleValue = false;

    context.dispatchEvent(new Event(eventName));

    await waitPromise;

    expect(mock).toHaveBeenCalledWith(false);

    disconnect();
  });
});

test('onElementVisibilityChange on element removed must remove the all the listeners if there are no more elements to check', () => {
  const target = document.createElement('DIV');
  const mock = jest.fn();

  mockIsElementVisibleValue = true;

  window.removeEventListener = jest.fn();
  document.removeEventListener = jest.fn();

  const disconnect = onElementVisibilityChange(target, (...args) => mock(...args));

  expect(window.removeEventListener).not.toHaveBeenCalledWith('resize', expect.any(Function));
  expect(window.removeEventListener).not.toHaveBeenCalledWith('orientationchange', expect.any(Function));
  expect(document.removeEventListener).not.toHaveBeenCalledWith('visibilitychange', expect.any(Function));

  disconnect();

  expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  expect(window.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
});

test('onElementVisibilityChange on element remove must not remove the scroll listener if there other checkeed elements use the same scrollableElement', () => {
  const target = document.createElement('DIV');
  const mock = jest.fn();

  mockIsElementVisibleValue = true;

  window.removeEventListener = jest.fn();

  const disconnect = onElementVisibilityChange(target, (...args) => mock(...args));
  const disconnect2 = onElementVisibilityChange(target, (...args) => mock(...args));

  expect(window.removeEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));

  disconnect();
  expect(window.removeEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));

  disconnect2();
  expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
});
