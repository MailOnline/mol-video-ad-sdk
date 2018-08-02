import {
  linearEvents,
  pixelTracker,
  trackLinearEvent,
  trackError
} from '../index';

test('tracker must publish `linearEvents`', () => {
  expect(linearEvents).toBeInstanceOf(Object);
});

test('tracker must publish `pixelTracker`', () => {
  expect(pixelTracker).toBeInstanceOf(Function);
});

test('tracker must publish `trackLinearEvent`', () => {
  expect(trackLinearEvent).toBeInstanceOf(Function);
});

test('tracker must publish `trackError`', () => {
  expect(trackError).toBeInstanceOf(Function);
});

