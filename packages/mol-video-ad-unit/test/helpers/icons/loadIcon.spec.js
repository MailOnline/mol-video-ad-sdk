import loadIcon from '../../../src/helpers/icons/loadIcon';
import createResource from '../../../src/helpers/resources/createResource';

const mockResource = document.createElement('IMG');

mockResource.classList.add('mock-resource-element');

jest.mock('../../../src/helpers/resources/createResource', () => jest.fn(() => mockResource));

let icon;
let placeholder;

beforeEach(() => {
  icon = {
    staticResource: 'http://test.example.com/resource'
  };

  placeholder = document.createElement('DIV');
});

afterEach(() => {
  icon = null;
  placeholder = null;
});

test('loadIcon must return a promise', async () => {
  const promise = loadIcon(icon, {
    document,
    placeholder
  });

  const iconElement = placeholder.querySelector('.mock-resource-element');

  expect(iconElement.style.zIndex).toBe('-9999');

  iconElement.dispatchEvent(new Event('load'));

  const loadedIcon = await promise;

  expect(loadedIcon).toBe(iconElement);
  expect(loadedIcon.style.zIndex).toBe('0');
  expect(placeholder.querySelector('.mock-resource-element')).toBeNull();
});

test('loadIcon must reject the promise if there is a problem loading the icon', () => {
  const promise = loadIcon(icon, {
    document,
    placeholder
  });

  const iconElement = placeholder.querySelector('.mock-resource-element');

  expect(iconElement.style.zIndex).toBe('-9999');

  iconElement.dispatchEvent(new Event('error'));

  expect(promise).rejects.toBeInstanceOf(Error);
  expect(iconElement.style.zIndex).toBe('0');
  expect(placeholder.querySelector('.mock-resource-element')).toBeNull();
});

test('loadIcon must reject the promise if there is a problem creating the resource', () => {
  createResource.mockImplementation(() => () => {
    throw new Error('boom');
  });

  const promise = loadIcon(icon, {
    document,
    placeholder
  });

  expect(placeholder.querySelector('.mock-resource-element')).toBeNull();
  expect(promise).rejects.toBeInstanceOf(Error);
});
