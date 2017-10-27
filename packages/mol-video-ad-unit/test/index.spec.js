// eslint-disable-next-line import/no-namespace
import * as index from '../src/index';
import VastAdUnit from '../src/VastAdUnit';
import createVastAdUnit from '../src/createVastAdUnit';

test('must make the ad unit factory and the class public', () => {
  expect(index.createVastAdUnit).toBe(createVastAdUnit);
  expect(index.VastAdUnit).toBe(VastAdUnit);
});
