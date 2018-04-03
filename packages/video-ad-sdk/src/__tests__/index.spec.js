import {
  createVideoAdContainer,
  createVideoAdUnit,
  load,
  loadNext
} from '../index';

test('@mol/video-ad-manager must publish `load`', () => {
  expect(load).toBeInstanceOf(Function);
});

test('@mol/video-ad-manager must publish `loadNext`', () => {
  expect(loadNext).toBeInstanceOf(Function);
});

test('@mol/video-ad-manager must publish `createVideoAdContainer`', () => {
  expect(createVideoAdContainer).toBeInstanceOf(Function);
});

test('@mol/video-ad-manager must publish `createVideoAdUnit`', () => {
  expect(createVideoAdUnit).toBeInstanceOf(Function);
});

