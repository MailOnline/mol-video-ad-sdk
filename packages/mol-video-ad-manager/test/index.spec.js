import {load} from '../src/index';

test('mol-video-ad-manager must publish the load function', () => {
  expect(load).toBeInstanceOf(Function);
});

