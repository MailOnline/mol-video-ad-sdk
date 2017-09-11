import {supportsElementObservers} from '../src/index';

test('supportsElementOnservers must return false if the MutationObserver api is not supported', () => {
  expect(supportsElementObservers).toBe(false);
});
