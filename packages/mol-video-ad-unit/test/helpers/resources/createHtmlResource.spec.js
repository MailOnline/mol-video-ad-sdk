import createHtmlResource from '../../../src/helpers/resources/createHtmlResource';

test('createHtmlResource must return an iframe', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLIFrameElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe('100');
  expect(resource.height).toBe('100');
  expect(resource.sandbox).toBe('allow-forms');
});

test('createHtmlResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLIFrameElement);
  expect(resource.src).toBe(src);
  expect(resource.width).toBe('');
  expect(resource.height).toBe('');
});
