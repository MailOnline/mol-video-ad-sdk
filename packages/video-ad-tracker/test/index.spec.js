import {
  linearEvents,
  pixelTracker,
  trackLinearEvent,
  trackError
} from '../src/index';

test('@mol/video-ad-tracker must publish `load`', () => {
  expect(linearEvents).toBeInstanceOf(Object);
});

test('@mol/video-ad-tracker must publish `loadNext`', () => {
  expect(pixelTracker).toBeInstanceOf(Function);
});

test('@mol/video-ad-tracker must publish `isAdPod`', () => {
  expect(trackLinearEvent).toBeInstanceOf(Function);
});

test('@mol/video-ad-tracker must publish `createVideoAdContainer`', () => {
  expect(trackError).toBeInstanceOf(Function);
});

