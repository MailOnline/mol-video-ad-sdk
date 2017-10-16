import createIframeResource from '../../../src/helpers/resources/createIframeResource';

test('createIframeResource must return an iframe', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/iframeResource';
  const resource = createIframeResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLIFrameElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe('100');
  expect(resource.height).toBe('100');
  expect(resource.sandbox).toBe('allow-forms allow-popups allow-scripts');
});

test('createIframeResource must not set the with and height if not passed', () => {
  const payload = {
    data: {},
    document
  };
  const src = 'http://test.example.com/iframeResource';
  const resource = createIframeResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLIFrameElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe('');
  expect(resource.height).toBe('');
});
