import waitFor from '../../dom/waitFor';
import createHtmlResource from '../createHtmlResource';

test('createHtmlResource must return an div', () => {
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLDivElement);
  expect(resource.style.width).toBe('100px');
  expect(resource.style.height).toBe('100px');
});

test('createHtmlResource must not set the width and height if not passed', () => {
  const payload = {
    data: {},
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);

  expect(resource).toBeInstanceOf(HTMLDivElement);
  expect(resource.style.width).toBe('');
  expect(resource.style.height).toBe('');
});

test('createHtmlResource returned div must emit load once ready', async () => {
  const htmlFragment = '<div></div>';
  const successResponse = {
    headers: {
      get: () => 'text/html'
    },
    status: 200,
    text: () => htmlFragment
  };

  global.fetch = jest.fn(() => Promise.resolve(successResponse));
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);
  const {promise} = waitFor(resource, 'load');

  await promise;

  expect(resource.innerHTML).toEqual(htmlFragment);
});

test('createHtmlResource returned div must emit error if there is a problem loading the html', async () => {
  const htmlFragment = '<div></div>';
  const successResponse = {
    headers: {
      get: () => 'text/json'
    },
    status: 200,
    text: () => htmlFragment
  };

  global.fetch = jest.fn(() => Promise.resolve(successResponse));
  const payload = {
    data: {
      height: 100,
      width: 100
    },
    document
  };
  const src = 'http://test.example.com/htmlResource';
  const resource = createHtmlResource(src, payload);
  const {promise} = waitFor(resource, 'error');

  await promise;

  expect(resource.innerHTML).toEqual('');
});

