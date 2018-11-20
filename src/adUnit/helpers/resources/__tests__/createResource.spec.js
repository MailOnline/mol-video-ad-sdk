import createHtmlResource from '../createHtmlResource';
import createIframeResource from '../createIframeResource';
import createStaticResource from '../createStaticResource';
import createResource from '../createResource';

const mockResource = document.createElement('DIV');

jest.mock('../createHtmlResource', () => jest.fn(() => mockResource));
jest.mock('../createIframeResource', () => jest.fn(() => mockResource));
jest.mock('../createStaticResource', () => jest.fn(() => mockResource));

test('createResource must create an static resource if you pass `staticResource` in the data', () => {
  const src = 'http://test.example.com/resource';
  const data = {
    staticResource: src
  };
  const resource = createResource(document, data);

  expect(resource).toBe(mockResource);
  expect(createStaticResource).toBeCalledWith(src, expect.objectContaining({
    data,
    document
  }));
});

test('createResource must create a html resource if you pass `htmlResource` in the data', () => {
  const src = 'http://test.example.com/resource';
  const data = {
    htmlResource: src
  };
  const resource = createResource(document, data);

  expect(resource).toBe(mockResource);
  expect(createHtmlResource).toBeCalledWith(src, expect.objectContaining({
    data,
    document
  }));
});

test('createResource must create an iframe resource if you pass `iFrameResource` in the data', () => {
  const src = 'http://test.example.com/resource';
  const data = {
    iFrameResource: src
  };
  const resource = createResource(document, data);

  expect(resource).toBe(mockResource);
  expect(createIframeResource).toBeCalledWith(src, expect.objectContaining({
    data,
    document
  }));
});
