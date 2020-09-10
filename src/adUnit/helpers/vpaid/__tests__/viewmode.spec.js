import viewmode from '../viewmode';

describe('viewmode', () => {
  let origScreen;

  beforeEach(() => {
    origScreen = window.screen;

    Object.defineProperty(window, 'screen', {
      value: {
        height: 800,
        width: 1200
      },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'screen', {
      value: origScreen,
      writable: true
    });
  });

  test('must return `fullscreen` if the width and the height are about the viewport size', () => {
    expect(viewmode(window.screen.width, window.screen.height)).toBe('fullscreen');
  });

  test('must return `thumbnail` if the width is smaller than 400', () => {
    expect(viewmode(300, 200)).toBe('thumbnail');
  });

  test('must return `normal` if width is bigger 400 and not in fullscreen', () => {
    expect(viewmode(640, 328)).toBe('normal');
  });
});
