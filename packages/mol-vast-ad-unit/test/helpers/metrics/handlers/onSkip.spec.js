import {createVideoAdContainer} from 'mol-video-ad-container';
import onSkip from '../../../../src/helpers/metrics/handlers/onSkip';
import {skip} from '../../../../src/helpers/metrics/linearTrackingEvents';

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

test('onSkip must append the skip control to the videoAdContainer');
test('onSkip must be possible to pass a skipControl factory method');
test('onSkip must call the callback with skip if the user clicks in the control');
test('onSkip disconnect must remove the skip control if exists');
test('onSkip disconnect must prevent the skip control from appearing');
