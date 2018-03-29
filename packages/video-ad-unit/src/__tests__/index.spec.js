// eslint-disable-next-line import/no-namespace
import * as index from '../index';
import VastAdUnit from '../VastAdUnit';
import createVastAdUnit from '../createVastAdUnit';

test('must make the ad unit factory and the class public', () => {
  expect(index.createVastAdUnit).toBe(createVastAdUnit);
  expect(index.VastAdUnit).toBe(VastAdUnit);
});
