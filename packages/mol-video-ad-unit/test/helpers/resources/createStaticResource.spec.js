import createStaticResource from '../../../src/helpers/resources/createStaticResource';

test('createStaticResource must return an image', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/staticResource';
  const resource = createStaticResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLImageElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe(100);
  expect(resource.height).toBe(100);
});

test('createStaticResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  };
  const src = 'http://test.example.com/staticResource';
  const resource = createStaticResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLImageElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe(0);
  expect(resource.height).toBe(0);
});
