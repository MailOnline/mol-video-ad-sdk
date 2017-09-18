import onElementRemove from '../src/onElementRemove';
import MutationObserver from '../src/helpers/MutationObserver';

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

  MockMutationObserver.simulateNodeRemoval = (node) => mockHandler([{removedNodes: [node]}]);
  MockMutationObserver.observe = observe;
  MockMutationObserver.disconnect = disconnect;

  return MockMutationObserver;
});

test('onElementRemove', () => {
  expect(onElementRemove).toEqual(expect.any(Function));
});

test('onElementRemove must complain if the passed target is not an Element', () => {
  expect(onElementRemove).toThrow(TypeError);
});

test('onElementRemove mut complain if you don\'t pass a callback function', () => {
  expect(() => onElementRemove(document.createElement('DIV'))).toThrow(TypeError);
});

test('onElementRemove must call the callback if the target gets removed', () => {
  const target = document.createElement('DIV');
  const mock = jest.fn();

  onElementRemove(target, () => mock());

  expect(MutationObserver.observe).toHaveBeenCalledWith(target, {
    attributes: false,
    characterData: false,
    childList: true
  });
  expect(mock).not.toHaveBeenCalled();

  MutationObserver.simulateNodeRemoval(target);

  expect(mock).toHaveBeenCalledTimes(1);
});

test('onElementRemove must disconnect the observer', () => {
  const target = document.createElement('DIV');
  const disconnect = onElementRemove(target, () => {});

  expect(MutationObserver.disconnect).not.toHaveBeenCalled();
  disconnect();
  expect(MutationObserver.disconnect).toHaveBeenCalledTimes(1);
});
