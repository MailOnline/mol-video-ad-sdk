import {METHODS} from '../api';
import isValidVpaidCreative from '../isValidVpaidCreative';

const createVpaidCreative = () => METHODS.reduce((acc, key) => {
  acc[key] = () => {};

  return acc;
}, {});

test('isValidVpaidCreative must return false if doesn\'t implement the vpaid interface', () => {
  for (const method of METHODS) {
    const creative = createVpaidCreative();

    delete creative[method];

    expect(isValidVpaidCreative(creative)).toBe(false);
  }

  expect(isValidVpaidCreative(createVpaidCreative())).toBe(true);
});
