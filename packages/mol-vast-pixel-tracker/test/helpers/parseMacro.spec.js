import parseMacro from '../../src/helpers/parseMacro';

test('parseMacro must replace the passed variables in the macro', () => {
  const macro = 'http://test.example.com/[ERRORCODE]/[BLA]';

  expect(parseMacro(macro, {})).toBe(macro);
  expect(parseMacro(macro, {ERRORCODE: '101'})).toBe('http://test.example.com/101/[BLA]');
  expect(parseMacro(macro, {
    BLA: 'bla',
    ERRORCODE: '101'
  })).toBe('http://test.example.com/101/bla');
});

test('parseMacro fill the CACHEBUSTING variable if not provided', () => {
  const macro = 'http://test.example.com/[CACHEBUSTING]';

  expect(parseMacro(macro, {})).not.toBe(macro);
  expect(parseMacro(macro, {})).toEqual(expect.stringMatching(/http:\/\/test.example.com\/\d+/));
});

test('parseMacro must not fill the CACHEBUSTING variable if provided', () => {
  const macro = 'http://test.example.com/[CACHEBUSTING]';

  expect(parseMacro(macro, {CACHEBUSTING: 'foo'})).toBe('http://test.example.com/foo');
});
