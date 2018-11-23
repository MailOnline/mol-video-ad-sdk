import createVideoAdContainer from '../../../../../adContainer/createVideoAdContainer';
import {linearEvents} from '../../../../../tracker';
import onSkip from '../onSkip';

const {skip} = linearEvents;
let videoAdContainer;
let callback;

beforeEach(async () => {
  callback = jest.fn();
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  const {videoElement} = videoAdContainer;

  Object.defineProperty(videoElement, 'currentTime', {
    value: 0,
    writable: true
  });
});

afterEach(() => {
  callback = null;
  videoAdContainer = null;
});

test('onSkip must do nothing if the current time is less than the offset', () => {
  const {element, videoElement} = videoAdContainer;

  onSkip(videoAdContainer, callback, {skipoffset: 5000});

  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);

  videoElement.currentTime = 1;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);

  videoElement.currentTime = 4;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).not.toEqual(null);
});

test('onSkip must call the callback with skip if the user clicks in the control', () => {
  const {element, videoElement} = videoAdContainer;

  onSkip(videoAdContainer, callback, {skipoffset: 5000});

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);

  const skipControl = element.querySelector('.mol-vast-skip-control');

  skipControl.click();

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(skip);
});

test('onSkip must be possible to pass a skipControl factory method', () => {
  const {element, videoElement} = videoAdContainer;

  onSkip(videoAdContainer, callback, {
    createSkipControl: () => {
      const skipBtn = document.createElement('BUTTON');

      skipBtn.classList.add('custom-skip-control');

      return skipBtn;
    },
    skipoffset: 5000
  });

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);

  const skipControl = element.querySelector('.custom-skip-control');

  skipControl.click();

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(skip);
});

test('onSkip disconnect must remove the skip control if exists', () => {
  const {element, videoElement} = videoAdContainer;
  const disconnect = onSkip(videoAdContainer, callback, {skipoffset: 5000});

  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).not.toEqual(null);

  disconnect();
  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);
});

test('onSkip disconnect must prevent the skip control from appearing', () => {
  const {element, videoElement} = videoAdContainer;
  const disconnect = onSkip(videoAdContainer, callback, {skipoffset: 5000});

  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);

  disconnect();
  videoElement.currentTime = 5;
  videoElement.dispatchEvent(new Event('timeupdate'));
  expect(callback).toHaveBeenCalledTimes(0);
  expect(element.querySelector('.mol-vast-skip-control')).toEqual(null);
});
