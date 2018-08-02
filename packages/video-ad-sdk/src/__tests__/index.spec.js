import {
  run,
  runWaterfall,
  requestAd,
  requestNextAd
} from '../index';

test('must publish `requestAd`', () => {
  expect(requestAd).toBeInstanceOf(Function);
});

test('must publish `requestNextAd`', () => {
  expect(requestNextAd).toBeInstanceOf(Function);
});

test('must publish `run`', () => {
  expect(run).toBeInstanceOf(Function);
});

test('must publish `runWaterfall`', () => {
  expect(runWaterfall).toBeInstanceOf(Function);
});

