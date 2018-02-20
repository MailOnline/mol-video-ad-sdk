import createHtmlResource from '../../../src/helpers/resources/createHtmlResource';
import createIframeResource from '../../../src/helpers/resources/createIframeResource';
import createStaticResource from '../../../src/helpers/resources/createStaticResource';
import createResource from '../../../src/helpers/resources/createResource';

const mockResource = document.createElement('DIV');

jest.mock('../../../src/helpers/resources/createHtmlResource', () => jest.fn(() => mockResource));
jest.mock('../../../src/helpers/resources/createIframeResource', () => jest.fn(() => mockResource));
jest.mock('../../../src/helpers/resources/createStaticResource', () => jest.fn(() => mockResource));

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

test('createResource must create an iframe resource if you pass `iframeResource` in the data', () => {
  const src = 'http://test.example.com/resource';
  const data = {
    iframeResource: src
  };
  const resource = createResource(document, data);

  expect(resource).toBe(mockResource);
  expect(createIframeResource).toBeCalledWith(src, expect.objectContaining({
    data,
    document
  }));
});
