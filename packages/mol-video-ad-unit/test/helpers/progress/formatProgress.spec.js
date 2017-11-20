import formatProgress from '../../../src/helpers/progress/formatProgress';

test('formatProgress must format the passed ms to hh:mm:ss.mmm', () => {
  const hourInMs = 60 * 60 * 1000;
  const minInMs = 60 * 1000;
  const secInMs = 1000;

  expect(formatProgress(Number(secInMs))).toBe('00:00:01.000');
  expect(formatProgress(Number(6 * hourInMs))).toBe('06:00:00.000');
  expect(formatProgress(Number(2 * hourInMs + 14 * minInMs + 10 * secInMs + 23))).toBe('02:14:10.023');
});
