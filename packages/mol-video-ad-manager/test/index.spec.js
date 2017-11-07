import {
  load,
  loadNext
} from '../src/index';

test('mol-video-ad-manager must publish the load function', () => {
  expect(load).toBeInstanceOf(Function);
});

test('mol-video-ad-manager must publish the loadNext function', () => {
  expect(loadNext).toBeInstanceOf(Function);
});

