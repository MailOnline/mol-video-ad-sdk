import {createVideoAdContainer} from 'mol-video-ad-container';
import addIcons from '../../../src/helpers/icons/addIcons';
import createResource from '../../../src/helpers/resources/createResource';
import canBeRendered from '../../../src/helpers/icons/canBeRendered';

jest.mock('../../../src/helpers/resources/createResource');
jest.mock('../../../src/helpers/icons/canBeRendered');

const waitFor = (element, eventName) => new Promise((resolve) => element.addEventListener(eventName, resolve));

let videoAdContainer;
let logger;

beforeEach(async () => {
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  logger = {error: jest.fn()};
  const {videoElement} = videoAdContainer;

  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  });

  Object.defineProperty(videoElement, 'duration', {
    value: 10,
    writable: true
  });

  createResource.mockImplementation(() => {
    const resourceElement = document.createElement('IMG');

    resourceElement.classList.add('mock-icon-element');

    resourceElement.width = 100;
    resourceElement.height = 100;

    setTimeout(() => resourceElement.dispatchEvent(new Event('load')));

    return resourceElement;
  });

  canBeRendered.mockImplementation(() => true);
});

afterEach(() => {
  videoAdContainer = null;
  logger = null;
});

test('addIcons must add the icons to the video ad container', async () => {
  const icons = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element} = videoAdContainer;

  addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  icons.forEach((icon) => expect(element.contains(icon.element)).toBe(true));
});

test('addIcons must not the the icons whose offset is not meet yet', async () => {
  const icons = [
    {
      height: 20,
      offset: 5000,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element, videoElement} = videoAdContainer;

  addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(false);
  expect(element.contains(icons[1].element)).toBe(true);

  videoElement.currentTime = 5;

  videoElement.dispatchEvent(new Event('timeupdate'));

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);
});

test('addIcons must remove the already drawn icons before a redraw', async () => {
  const icons = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element, videoElement} = videoAdContainer;

  addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);

  videoElement.currentTime = 5;

  videoElement.dispatchEvent(new Event('timeupdate'));

  expect(element.contains(icons[0].element)).toBe(false);
  expect(element.contains(icons[1].element)).toBe(false);

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);
});

test('addIcons must remove the icons once the duration is met', async () => {
  const icons = [
    {
      duration: 5000,
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element, videoElement} = videoAdContainer;

  addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);

  videoElement.currentTime = 5.1;

  videoElement.dispatchEvent(new Event('timeupdate'));

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(false);
  expect(element.contains(icons[1].element)).toBe(true);
});

test('addIcons must return a remove function', async () => {
  const icons = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element} = videoAdContainer;

  const removeIcons = addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);

  removeIcons();

  expect(element.contains(icons[0].element)).toBe(false);
  expect(element.contains(icons[1].element)).toBe(false);
});

test('addIcons on remove must remove the icons on corner cases too', async () => {
  const icons = [
    {
      height: 20,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element, videoElement} = videoAdContainer;

  const removeIcons = addIcons(icons, {
    logger,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(true);
  expect(element.contains(icons[1].element)).toBe(true);

  videoElement.currentTime = 6;

  videoElement.dispatchEvent(new Event('timeupdate'));

  removeIcons();

  await waitFor(element, 'iconsdrawn');

  expect(element.contains(icons[0].element)).toBe(false);
  expect(element.contains(icons[1].element)).toBe(false);
});

test('addIcons must call onIconView hook the moment the icon gets added to the page', async () => {
  const icons = [
    {
      height: 20,
      offset: 5000,
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      height: 20,
      width: 20,
      xPosition: 'left',
      yPosition: 'top'
    }
  ];
  const {element, videoElement} = videoAdContainer;
  const onIconView = jest.fn();

  addIcons(icons, {
    logger,
    onIconView,
    videoAdContainer
  });

  await waitFor(element, 'iconsdrawn');

  expect(onIconView).toHaveBeenCalledTimes(1);
  expect(onIconView).toHaveBeenCalledWith(icons[1]);

  videoElement.currentTime = 5;

  videoElement.dispatchEvent(new Event('timeupdate'));

  await waitFor(element, 'iconsdrawn');

  expect(onIconView).toHaveBeenCalledTimes(2);
  expect(onIconView).toHaveBeenCalledWith(icons[0]);
  expect(onIconView).toHaveBeenCalledWith(icons[1]);
});

