import viewmode from '../viewmode';

describe('viewmode', () => {
  test('must return `fullscreen` if the width and the height are about the viewport size', () => {
    expect(viewmode(innerWidth, innerHeight)).toBe('fullscreen');
  });

  test('must return `thumbail` if the width is smaller than 400', () => {
    expect(viewmode(300, 200)).toBe('thumbnail');
  });

  test('must reutn `normal` if width is bigger 400 and not in fullscreen', () => {
    expect(viewmode(640, 328)).toBe('normal');
  });
});
