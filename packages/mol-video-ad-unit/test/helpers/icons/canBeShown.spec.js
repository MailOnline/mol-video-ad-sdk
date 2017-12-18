import canBeShown from '../../../src/helpers/icons/canBeShown';

let videoElement;

beforeEach(() => {
  videoElement = document.createElement('VIDEO');

  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  });

  Object.defineProperty(videoElement, 'duration', {
    value: 10,
    writable: true
  });
});

afterEach(() => {
  videoElement = null;
});

test('canBeShown must return true if the icon has no offset nor duration', () => {
  const icon = {};

  expect(canBeShown(icon, videoElement)).toBe(true);
});

test('canBeShown must return false if the current time is less than the offset', () => {
  const icon = {
    offset: 5000
  };

  expect(canBeShown(icon, videoElement)).toBe(false);

  videoElement.currentTime = 1.5;
  expect(canBeShown(icon, videoElement)).toBe(false);

  videoElement.currentTime = 5;

  expect(canBeShown(icon, videoElement)).toBe(true);
});

test('canBeShown must return false if the current time is less than the duration plus the offset', () => {
  const icon = {
    duration: 3000,
    offset: 5000
  };

  videoElement.currentTime = 1.5;
  expect(canBeShown(icon, videoElement)).toBe(false);

  videoElement.currentTime = 5;

  expect(canBeShown(icon, videoElement)).toBe(true);

  videoElement.currentTime = 8.1;

  expect(canBeShown(icon, videoElement)).toBe(false);

  icon.offset = undefined;
  videoElement.currentTime = 2;

  expect(canBeShown(icon, videoElement)).toBe(true);
});

