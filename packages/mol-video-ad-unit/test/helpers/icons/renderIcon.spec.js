import loadResource from '../../../src/helpers/resources/loadResource';
import renderIcon from '../../../src/helpers/icons/renderIcon';
import updateIcon from '../../../src/helpers/icons/updateIcon';
import canBeRendered from '../../../src/helpers/icons/canBeRendered';

jest.mock('../../../src/helpers/resources/loadResource');
jest.mock('../../../src/helpers/icons/updateIcon');
jest.mock('../../../src/helpers/icons/canBeRendered');

let config;
let icon;
let iconResource;
let placeholder;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  iconResource = document.createElement('DIV');
  config = {
    placeholder
  };
  icon = {
    height: 5,
    left: 0,
    top: 0,
    updated: true,
    width: 5,
    xPosition: 'left',
    yPosition: 'top'
  };
});

afterEach(() => {
  config = null;
  placeholder = null;
  iconResource = null;
  placeholder = null;
});

test('renderIcon must fail if there was a problem creating the icon', () => {
  const loadingError = new Error('problem loading icon');

  loadResource.mockImplementation(() => Promise.reject(loadingError));
  expect(renderIcon(icon, config)).rejects.toBe(loadingError);
});

test('renderIcon must fail if the icon can not be rendered', () => {
  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => icon);
  canBeRendered.mockImplementation(() => false);
  expect(renderIcon(icon, config)).rejects.toThrow('Icon can\'t be rendered');
});

test('must append the icon to the placeholder if three is no problem', async () => {
  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => icon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  expect(placeholder.contains(iconResource)).toBe(true);
});

test('renderIcon must reuse previously created icons', async () => {
  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => icon);
  canBeRendered.mockImplementation(() => true);

  const renderedIcon = await renderIcon(icon, config);

  loadResource.mockClear();

  await renderIcon(renderedIcon, config);

  expect(loadResource).not.toHaveBeenCalled();

  expect(placeholder.contains(iconResource)).toBe(true);
});

test('renderIcon must return the updated icon', () => {
  const updatedIcon = Object.assign({}, icon);

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  expect(renderIcon(icon, config)).resolves.toBe(updatedIcon);
});

test('renderIcon must style the icon Element', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: true,
    width: 6
  };

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  const iconElement = icon.element;

  expect(iconElement.height).toEqual(updatedIcon.height);
  expect(iconElement.width).toEqual(updatedIcon.width);
  expect(iconElement.style.position).toEqual('absolute');
  expect(iconElement.style.left).toEqual(`${updatedIcon.left}px`);
  expect(iconElement.style.top).toEqual(`${updatedIcon.top}px`);
  expect(iconElement.style.height).toEqual(`${updatedIcon.height}px`);
  expect(iconElement.style.width).toEqual(`${updatedIcon.width}px`);
});

test('renderIcon must wrap the resource with an anchor', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  };

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  const iconElement = icon.element;

  expect(iconElement).toBeInstanceOf(HTMLAnchorElement);
  expect(iconElement.href).toBe('');
  expect(iconElement.target).toBe('');
  expect(iconResource.parentNode).toBe(iconElement);
  expect(iconResource.width).toBe('100%');
  expect(iconResource.height).toBe('100%');
  expect(iconResource.style.width).toBe('100%');
  expect(iconResource.style.height).toBe('100%');
});

test('renderIcon element anchor must have the clickThrough url if passed', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  };

  icon.iconClickthrough = 'http://test.example.com/iconClickthrough';

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  const iconElement = icon.element;

  expect(iconElement).toBeInstanceOf(HTMLAnchorElement);
  expect(iconElement.href).toBe(icon.iconClickthrough);
  expect(iconElement.target).toBe('_blank');
});

test('renderIcon element anchor on click must call the passed onIconClick method', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    width: 6
  };

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  config.onIconClick = jest.fn();
  await renderIcon(icon, config);

  const iconElement = icon.element;

  iconElement.click();

  expect(config.onIconClick).toHaveBeenCalledTimes(1);
  expect(config.onIconClick).toHaveBeenCalledWith(icon);
});

test('renderIcon must avoid adding the element to the dom if not needed', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: false,
    width: 6
  };

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  expect(icon.element.parentNode).toEqual(null);
  updatedIcon.updated = true;

  await renderIcon(icon, config);

  expect(icon.element.parentNode).toBe(placeholder);
});

test('renderIcon must must remove an icon that can no longer be rendered', async () => {
  const updatedIcon = {
    height: 3,
    left: 1,
    top: 4,
    updated: true,
    width: 6
  };

  loadResource.mockImplementation(() => Promise.resolve(iconResource));
  updateIcon.mockImplementation(() => updatedIcon);
  canBeRendered.mockImplementation(() => true);

  await renderIcon(icon, config);

  expect(icon.element.parentNode).toBe(placeholder);

  canBeRendered.mockImplementation(() => false);

  try {
    await renderIcon(icon, config);
  } catch (error) {
    // Do nothing
  }

  expect(icon.element.parentNode).toEqual(null);
});
