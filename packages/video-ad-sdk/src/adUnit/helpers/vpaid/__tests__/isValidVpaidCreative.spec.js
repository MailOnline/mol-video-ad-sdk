import vpaidMethods from '../vpaidMethods';
import isValidVpaidCreative from '../isValidVpaidCreative';

const createVpaidCreative = () => vpaidMethods.reduce((acc, key) => {
  acc[key] = () => {};

  return acc;
}, {});

test('isValidVpaidCreative must return false if doesn\'t implement the vpaid interface', () => {
  for (const method of vpaidMethods) {
    const creative = createVpaidCreative();

    delete creative[method];

    expect(isValidVpaidCreative(creative)).toBe(false);
  }

  expect(isValidVpaidCreative(createVpaidCreative())).toBe(true);
});
