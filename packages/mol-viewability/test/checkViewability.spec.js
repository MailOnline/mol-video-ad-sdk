import checkViewability from '../src/checkViewability';

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

let mockisElementVisibleValue = true;

jest.mock('lodash/debounce', () => (fn) => fn);
jest.mock('../src/isElementVisible', () => () => mockisElementVisibleValue);
jest.mock('../src/helpers/MutationObserver', () => class MockMutationObserver {
  constructor (handler) {
    const observe = jest.fn();
    const disconnect = jest.fn();

    this.observe = observe;
    this.disconnect = disconnect;

    global.moMock = {
      disconnect,
      observe,
      reset: () => {
        disconnect.mockClear();
        observe.mockClear();
      },
      simulateNodeRemoval: (node) => handler([{removedNodes: [node]}])
    };
  }
});

beforeEach(() => {
  global.moMock.reset();
});

test('checkViewability must be a funtion', () => {
  expect(checkViewability).toEqual(expect.any(Function));
});

test('checkViewability must complain if element is missing', () => {
  expect(() => {
    checkViewability();
  }).toThrowError('Passed Element is not an instance of Element.');
});

test('checkViewability must complain if emit is missing', () => {
  expect(() => {
    const element = global.document.createElement('DIV');

    checkViewability(element);
  }).toThrowError('Passed emit is not a function.');
});

test('checkViewability must call emit if the element is visible', () => {
  const element = global.document.createElement('DIV');
  const emit = jest.fn();

  const disconnect = checkViewability(element, emit);

  expect(emit).toHaveBeenCalledWith(true);

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
  test(`checkViewability must call emit with true if the element becomes visible on ${eventName}`, async () => {
    expect.assertions(2);
    const element = document.createElement('DIV');
    const emit = jest.fn();

    mockisElementVisibleValue = false;

    const disconnect = checkViewability(element, emit);

    expect(emit).not.toHaveBeenCalled();

    const waitPromise = waitForEvent(eventName, context);

    mockisElementVisibleValue = true;

    context.dispatchEvent(new Event(eventName));

    await waitPromise;

    expect(emit).toHaveBeenCalledWith(true);

    disconnect();
  });

  test(`checkViewability must call emit with false if the element becomes hidden on ${eventName}`, async () => {
    expect.assertions(2);
    const element = document.createElement('DIV');
    const emit = jest.fn();

    mockisElementVisibleValue = true;

    const disconnect = checkViewability(element, emit);

    expect(emit).toHaveBeenCalledWith(true);

    const waitPromise = waitForEvent(eventName, context);

    mockisElementVisibleValue = false;

    context.dispatchEvent(new Event(eventName));

    await waitPromise;

    expect(emit).toHaveBeenCalledWith(false);

    disconnect();
  });
});

test('checkViewability on element removed must remove the all the listeners if there are no more elements to check', () => {
  const element = document.createElement('DIV');
  const emit = jest.fn();

  mockisElementVisibleValue = true;

  window.removeEventListener = jest.fn();
  document.removeEventListener = jest.fn();

  const disconnect = checkViewability(element, emit);

  expect(window.removeEventListener).not.toHaveBeenCalledWith('resize', expect.any(Function));
  expect(window.removeEventListener).not.toHaveBeenCalledWith('orientationchange', expect.any(Function));
  expect(document.removeEventListener).not.toHaveBeenCalledWith('visibilitychange', expect.any(Function));

  disconnect();

  expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  expect(window.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
});

test('checkViewability on element remove must not remove the scroll listener if there other checkeed elements use the same scrollableElement', () => {
  const element = document.createElement('DIV');
  const emit = jest.fn();

  mockisElementVisibleValue = true;

  window.removeEventListener = jest.fn();

  const disconnect = checkViewability(element, emit);
  const disconnect2 = checkViewability(element, emit);

  expect(window.removeEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));

  disconnect();
  expect(window.removeEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));

  disconnect2();
  expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
});
