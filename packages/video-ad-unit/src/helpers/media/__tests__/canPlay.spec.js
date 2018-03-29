import canPlay from '../canPlay';

test('canPlay must delate on the video element to know if the mediaFile is supported', () => {
  let supported = true;
  const mockVideoElement = {
    canPlayType: jest.fn(() => supported)
  };
  const mediaFile = {
    src: 'http://test.media.mp4',
    type: 'video/mp4'
  };

  expect(canPlay(mockVideoElement, mediaFile)).toBe(true);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledTimes(1);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledWith(mediaFile.type);

  supported = false;
  mockVideoElement.canPlayType.mockClear();

  expect(canPlay(mockVideoElement, mediaFile)).toBe(false);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledTimes(1);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledWith(mediaFile.type);
});

test('canPlay try to guess the src type to check the video element support', () => {
  const mockVideoElement = {
    canPlayType: jest.fn(() => true)
  };
  const mediaFile = {
    src: 'http://test.media.mp4'
  };

  expect(canPlay(mockVideoElement, mediaFile)).toBe(true);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledTimes(1);
  expect(mockVideoElement.canPlayType).toHaveBeenCalledWith('video/mp4');
});
