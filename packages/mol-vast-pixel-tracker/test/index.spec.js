import {track} from '../src/index';

test('track must return an array of Images with the parsed macros as sources', () => {
  const urlMacros = [
    'https://test.example.com/0/[CODE]',
    'https://test.example.com/1/[CODE]',
    'https://test.example.com/2/[CODE]'
  ];

  const trackImgs = track(urlMacros, {CODE: 'TEST_CODE'});

  trackImgs.forEach((image, idx) => {
    expect(image).toBeInstanceOf(Image);
    expect(image.src).toBe(`https://test.example.com/${idx}/TEST_CODE`);
  });
});
