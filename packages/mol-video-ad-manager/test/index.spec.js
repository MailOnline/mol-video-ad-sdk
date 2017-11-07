import {
  createVideoAdContainer,
  createVideoAdUnit,
  isAdPod,
  load,
  loadNext
} from '../src/index';

test('mol-video-ad-manager must publish `load`', () => {
  expect(load).toBeInstanceOf(Function);
});

test('mol-video-ad-manager must publish `loadNext`', () => {
  expect(loadNext).toBeInstanceOf(Function);
});

test('mol-video-ad-manager must publish `isAdPod`', () => {
  expect(isAdPod).toBeInstanceOf(Function);
});

test('mol-video-ad-manager must publish `createVideoAdContainer`', () => {
  expect(createVideoAdContainer).toBeInstanceOf(Function);
});

test('mol-video-ad-manager must publish `createVideoAdUnit`', () => {
  expect(createVideoAdUnit).toBeInstanceOf(Function);
});

