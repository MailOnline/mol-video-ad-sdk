import {
  createVideoAdContainer,
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

