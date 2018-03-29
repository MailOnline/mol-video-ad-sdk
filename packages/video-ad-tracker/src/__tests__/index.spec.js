import {
  linearEvents,
  pixelTracker,
  trackLinearEvent,
  trackError
} from '../index';

test('@mol/video-ad-tracker must publish `linearEvents`', () => {
  expect(linearEvents).toBeInstanceOf(Object);
});

test('@mol/video-ad-tracker must publish `pixelTracker`', () => {
  expect(pixelTracker).toBeInstanceOf(Function);
});

test('@mol/video-ad-tracker must publish `trackLinearEvent`', () => {
  expect(trackLinearEvent).toBeInstanceOf(Function);
});

test('@mol/video-ad-tracker must publish `trackError`', () => {
  expect(trackError).toBeInstanceOf(Function);
});

