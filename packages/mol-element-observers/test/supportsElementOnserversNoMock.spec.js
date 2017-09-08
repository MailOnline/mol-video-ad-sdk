import {supportsElementOnservers} from '../src/index';

test('supportsElementOnservers must return false if the MutationObserver api is not supported', () => {
  expect(supportsElementOnservers).toBe(false);
});
