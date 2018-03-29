import createVideoAdContainer from '../createVideoAdContainer';
import SecureVideoAdContainer from '../SecureVideoAdContainer';
import VideoAdContainer from '../VideoAdContainer';

let placeholder;

beforeEach(() => {
  placeholder = document.createElement('DIV');
  document.body.appendChild(placeholder);
});

afterEach(() => {
  document.body.removeChild(placeholder);
});

test('createVideoAdContainer must return a promise', () => {
  expect(createVideoAdContainer(placeholder)).toBeInstanceOf(Promise);
});

test('createVideoAdContainer must resolve to a VideoAdContainer', async () => {
  const videoAdContainer = await createVideoAdContainer(placeholder);

  expect(videoAdContainer).toBeInstanceOf(VideoAdContainer);
});

test('createVideoAdContainer must resolve to a SecureVideoAdContainer if you pass the secure option to true', async () => {
  const videoAdContainer = await createVideoAdContainer(placeholder, {secure: true});

  expect(videoAdContainer).toBeInstanceOf(SecureVideoAdContainer);
});

test('createVideoAdContainer must complain if you don\'t pass a placeholder', () => {
  expect(createVideoAdContainer).toThrowError(TypeError);
});
