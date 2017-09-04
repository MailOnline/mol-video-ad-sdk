import waitForNodeRemoval from '../../src/helpers/waitForNodeRemoval';

jest.mock('../../src/helpers/MutationObserver', () => class MockMutationObserver {
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

test('waitForNodeRemoval must be a function', () => {
  expect(waitForNodeRemoval).toEqual(expect.any(Function));
});

test('watiForNodeRemoval must resolve the promise once the passed gets removed from the page', async () => {
  const node = document.createElement('div');
  const waitPromise = waitForNodeRemoval(node);

  global.moMock.simulateNodeRemoval(node);
  await expect(waitPromise).resolves.toEqual(node);

  expect(global.moMock.observe).toHaveBeenCalledWith(node, {childList: true});
});

test('watiForNodeRemoval must observe the parent of the node if possible', async () => {
  const node = document.createElement('div');

  document.body.appendChild(node);
  const waitPromise = waitForNodeRemoval(node);

  global.moMock.simulateNodeRemoval(node);
  await expect(waitPromise).resolves.toEqual(node);

  expect(global.moMock.observe).toHaveBeenCalledWith(document.body, {childList: true});
});

test('watiForNodeRemoval must disconnect the observer if there are no more nodes to observe', async () => {
  const node = document.createElement('div');
  const node2 = document.createElement('div');

  const waitPromise1 = waitForNodeRemoval(node);
  const waitPromise2 = waitForNodeRemoval(node2);

  global.moMock.simulateNodeRemoval(node);
  await waitPromise1;
  expect(global.moMock.disconnect).not.toHaveBeenCalled();

  global.moMock.simulateNodeRemoval(node2);
  await waitPromise2;
  expect(global.moMock.disconnect).toHaveBeenCalled();
});
