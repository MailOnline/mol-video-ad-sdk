import {
  checkViewability,
  isElementVisible
} from '../src/index';

test('must expose checkViewability, isElementVisible methods', () => {
  expect(checkViewability).toEqual(expect.any(Function));
  expect(isElementVisible).toEqual(expect.any(Function));
});
