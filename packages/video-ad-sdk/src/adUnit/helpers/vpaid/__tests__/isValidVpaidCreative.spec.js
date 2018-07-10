import isValidVpaidCreative, {VPAID_CREATIVE_METHODS} from '../isValidVpaidCreative';

const createVpaidCreative = () => VPAID_CREATIVE_METHODS.reduce((acc, key) => {
  acc[key] = () => {};

  return acc;
}, {});

test('isValidVpaidCreative must return false if doesn\'t implement the vpaid interface', () => {
  for (const method of VPAID_CREATIVE_METHODS) {
    const creative = createVpaidCreative();

    delete creative[method];

    expect(isValidVpaidCreative(creative)).toBe(false);
  }

  expect(isValidVpaidCreative(createVpaidCreative())).toBe(true);
});
