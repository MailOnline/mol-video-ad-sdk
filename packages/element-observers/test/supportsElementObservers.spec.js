import {supportsElementObservers} from '../src/index';

jest.mock('../src/helpers/MutationObserver', () => class MockMutationObserver {
  constructor () {
    const observe = jest.fn();
    const disconnect = jest.fn();

    this.observe = observe;
    this.disconnect = disconnect;
  }
});

test('supportsElementOnservers must return true if the MutationObserver api is not supported', () => {
  expect(supportsElementObservers).toBe(true);
});
