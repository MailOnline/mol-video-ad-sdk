import onElementResize from '../src/onElementResize';
import MutationObserver from '../src/helpers/MutationObserver';

jest.mock('lodash/debounce', () => (fn) => fn);
jest.mock('../src/helpers/MutationObserver', () => {
  const observe = jest.fn();
  const disconnect = jest.fn();
  let mockHandler = null;

  class MockMutationObserver {
    constructor (handler) {
      mockHandler = handler;
      this.observe = observe;
      this.disconnect = disconnect;
    }
  }

  MockMutationObserver.observe = observe;
  MockMutationObserver.disconnect = disconnect;
  MockMutationObserver.simulateAttrMutation = (node, attributeName) => mockHandler([{
    attributeName,
    target: node
  }
  ]);

  return MockMutationObserver;
});

test('onElementResize', () => {
  expect(onElementResize).toEqual(expect.any(Function));
});

test('onElementResize must complain if the passed target is not an Element', () => {
  expect(onElementResize).toThrow(TypeError);
});

test('onElementResize mut complain if you don\'t pass a callback function', () => {
  expect(() => onElementResize(document.createElement('DIV'))).toThrow(TypeError);
});

test('onElementResize not must call the callback if the changed style does not change the element size', () => {
  const target = document.createElement('DIV');
  const mock = jest.fn();

  onElementResize(target, () => mock());

  expect(mock).not.toHaveBeenCalled();

  MutationObserver.simulateAttrMutation(target, 'style');

  expect(mock).not.toHaveBeenCalled();
});

test('onElementResize must call the callback if the element width changes on style change', () => {
  const target = document.createElement('DIV');
  const mock = jest.fn();

  onElementResize(target, () => mock());

  expect(mock).not.toHaveBeenCalled();

  target.style.width = '400px';
  MutationObserver.simulateAttrMutation(target, 'style');
  expect(mock).toHaveBeenCalled();
});
