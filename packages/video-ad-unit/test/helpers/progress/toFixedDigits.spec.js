import toFixedDigits from '../../../src/helpers/progress/toFixedDigits';

test('toFixedDigits must add zeros if missing to the passed number', () => {
  expect(toFixedDigits(2, 3)).toBe('002');
  expect(toFixedDigits(100, 3)).toBe('100');
  expect(toFixedDigits(25, 4)).toBe('0025');
});
