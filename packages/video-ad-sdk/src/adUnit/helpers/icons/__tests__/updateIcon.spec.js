import updateIcon from '../updateIcon';

const mockClientRect = (element, mockValue) => {
  element.getBoundingClientRect = jest.fn(() => mockValue);
};

let icon;
let iconElement;
let placeholder;
let drawnIcons;
let config;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  iconElement = document.createElement('IMG');
  icon = {};

  mockClientRect(placeholder, {
    height: 10,
    width: 10
  });

  drawnIcons = [
    {
      height: 3,
      left: 0,
      top: 0,
      width: 5,
      xPosition: 'left',
      yPosition: 'top'

    },
    {

      height: 3,
      left: 6,
      top: 0,
      width: 5,
      xPosition: 'right',
      yPosition: 'top'
    }
  ];

  config = {
    drawnIcons,
    placeholder
  };
});

afterEach(() => {
  placeholder = null;
  icon = null;
  iconElement = null;
  drawnIcons = null;
  config = null;
});

test('updateIcon must use the iconElement size if not provided', () => {
  mockClientRect(iconElement, {
    height: 1,
    width: 3
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 1,
    width: 3
  }));

  Object.assign(icon, {
    height: 4,
    width: 6
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    width: 6
  }));
});

test('updateIcon must use the custom position if provided', () => {
  Object.assign(icon, {
    height: 4,
    width: 6,
    xPosition: 2,
    yPosition: 2
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 2,
    top: 2,
    width: 6,
    xPosition: 2,
    yPosition: 2
  }));
});

test('updateIcon must calculate the dynamic left position taking the drawn icons into account', () => {
  Object.assign(icon, {
    height: 4,
    width: 6,
    xPosition: 'left',
    yPosition: 'top'
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 6,
    top: 0,
    width: 6,
    xPosition: 'left',
    yPosition: 'top'
  }));

  Object.assign(icon, {
    xPosition: 'right'
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: -2,
    top: 0,
    width: 6,
    xPosition: 'right',
    yPosition: 'top'
  }));
});

test('updateIcon must calculate the dynamic top position taking the drawn icons into account', () => {
  Object.assign(icon, {
    height: 4,
    width: 6,
    xPosition: 3,
    yPosition: 'top'
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 3,
    top: 0,
    width: 6,
    xPosition: 3,
    yPosition: 'top'
  }));

  Object.assign(icon, {
    yPosition: 'bottom'
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 3,
    top: 6,
    width: 6,
    xPosition: 3,
    yPosition: 'bottom'
  }));
});

test('updateIcon must assume dynamic position top, right if missing on the icon', () => {
  Object.assign(icon, {
    height: 4,
    width: 2
  });

  expect(updateIcon(icon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 2,
    top: 0,
    width: 2
  }));
});

test('updateIcon must mark the icon for redraw if needed', () => {
  Object.assign(icon, {
    height: 4,
    width: 2
  });

  const updatedIcon = updateIcon(icon, iconElement, config);

  expect(updatedIcon).toEqual(expect.objectContaining({
    height: 4,
    left: 2,
    top: 0,
    updated: true,
    width: 2
  }));

  expect(updateIcon(updatedIcon, iconElement, config)).toEqual(expect.objectContaining({
    height: 4,
    left: 2,
    top: 0,
    updated: false,
    width: 2
  }));
});

