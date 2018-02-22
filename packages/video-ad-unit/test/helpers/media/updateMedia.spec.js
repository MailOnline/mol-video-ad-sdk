import updateMedia from '../../../src/helpers/media/updateMedia';

const createMockVideoElement = ({currentTime = 0, playing = false}) => {
  const videoElement = document.createElement('video');

  videoElement.pause = jest.fn();
  videoElement.play = jest.fn();
  videoElement.load = jest.fn();

  Object.defineProperty(videoElement, 'currentTime', {
    value: currentTime,
    writable: true
  });

  Object.defineProperty(videoElement, 'paused', {
    value: !playing,
    writable: true
  });

  return videoElement;
};

test('must be a function', () => {
  expect(updateMedia).toBeInstanceOf(Function);
});

test('must change the source and update the current time', async () => {
  const media = {src: 'http://example.com/test.mp4'};
  const videoElement = createMockVideoElement({
    currentTime: 10,
    playing: false
  });

  const updatePromise = updateMedia(videoElement, media);

  expect(videoElement.pause).not.toBeCalled();
  expect(videoElement.load).toHaveBeenCalledTimes(1);
  expect(videoElement.play).not.toBeCalled();

  videoElement.dispatchEvent(new CustomEvent('loadeddata'));

  await updatePromise;

  expect(videoElement.pause).not.toBeCalled();
  expect(videoElement.load).toHaveBeenCalledTimes(1);
  expect(videoElement.play).not.toBeCalled();
  expect(videoElement.currentTime).toBe(10);
});

test('must play the video if the source was already playing', async () => {
  const media = {src: 'http://example.com/test.mp4'};
  const videoElement = createMockVideoElement({
    currentTime: 10,
    playing: true
  });

  const updatePromise = updateMedia(videoElement, media);

  expect(videoElement.pause).toHaveBeenCalledTimes(1);
  expect(videoElement.load).toHaveBeenCalledTimes(1);
  expect(videoElement.play).not.toBeCalled();

  videoElement.dispatchEvent(new CustomEvent('loadeddata'));

  await updatePromise;

  expect(videoElement.pause).toHaveBeenCalledTimes(1);
  expect(videoElement.load).toHaveBeenCalledTimes(1);
  expect(videoElement.play).toHaveBeenCalledTimes(1);
  expect(videoElement.currentTime).toBe(10);
});

