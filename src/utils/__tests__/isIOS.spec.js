/* eslint-disable filenames/match-regex */
import isIOS from '../isIOS';

describe('isIOS', () => {
  let origUserAgent;

  beforeEach(() => {
    origUserAgent = navigator.userAgent;

    Object.defineProperty(navigator, 'userAgent', {
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: origUserAgent,
      writable: true
    });
  });

  it('must be a function', () => {
    expect(isIOS).toBeInstanceOf(Function);
  });

  it('must return true if the useAgent contains iPad or iPod or iPhone', () => {
    expect(isIOS()).toBe(false);

    navigator.userAgent = `iPhone ${origUserAgent}`;
    expect(isIOS()).toBe(true);

    navigator.userAgent = `iPad ${origUserAgent}`;
    expect(isIOS()).toBe(true);

    navigator.userAgent = `iPod ${origUserAgent}`;
    expect(isIOS()).toBe(true);
  });

  it('must return false for IE user agents that contain iPhone', () => {
    window.MSStream = true;

    expect(isIOS()).toBe(false);

    navigator.userAgent = `iPhone ${origUserAgent}`;
    expect(isIOS()).toBe(false);

    navigator.userAgent = `iPad ${origUserAgent}`;
    expect(isIOS()).toBe(false);

    navigator.userAgent = `iPod ${origUserAgent}`;
    expect(isIOS()).toBe(false);

    delete window.MSStream;
  });
});
