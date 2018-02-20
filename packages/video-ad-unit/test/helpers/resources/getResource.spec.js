import getResource from '../../../src/helpers/resources/getResource';

test('getResource must get the source of the passed resource payload', () => {
  const src = 'http://test.example.com/resource';

  expect(getResource()).toBeUndefined();
  expect(getResource({
    staticResource: src
  })).toBe(src);
  expect(getResource({
    htmlResource: src
  })).toBe(src);
  expect(getResource({
    iFrameResource: src
  })).toBe(src);
});
