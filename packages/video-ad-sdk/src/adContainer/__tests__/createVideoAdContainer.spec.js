import createVideoAdContainer from '../createVideoAdContainer';
import VideoAdContainer from '../VideoAdContainer';

let placeholder;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  document.body.appendChild(placeholder);
});

afterEach(() => {
  document.body.removeChild(placeholder);
});

test('createVideoAdContainer must return a VideoAdContainer', () => {
  expect(createVideoAdContainer(placeholder)).toBeInstanceOf(VideoAdContainer);
});

test('createVideoAdContainer must resolve to a VideoAdContainer', async () => {
  const videoAdContainer = await createVideoAdContainer(placeholder);

  expect(videoAdContainer).toBeInstanceOf(VideoAdContainer);
});

test('createVideoAdContainer must complain if you don\'t pass a placeholder', () => {
  expect(createVideoAdContainer).toThrowError(TypeError);
});
