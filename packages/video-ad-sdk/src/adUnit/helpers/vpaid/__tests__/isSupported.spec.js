import isSupported, {SUPPORTED_MIMETYPES} from '../isSupported';

test('isSupported must return true if the type is supported and false otherwise', () => {
  for (const type of SUPPORTED_MIMETYPES) {
    expect(isSupported({type})).toBe(true);
  }

  expect(isSupported({type: 'application/x-shockwave-flash'})).toBe(false);
});
