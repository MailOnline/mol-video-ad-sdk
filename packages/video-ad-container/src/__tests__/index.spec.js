// eslint-disable-next-line import/no-namespace
import * as index from '../index';
import createVideoAdContainer from '../createVideoAdContainer';
import SecureVideoAdContainer from '../SecureVideoAdContainer';
import VideoAdContainer from '../VideoAdContainer';

test('index must publish the factory and the 2 classes', () => {
  expect(index.createVideoAdContainer).toBe(createVideoAdContainer);
  expect(index.SecureVideoAdContainer).toBe(SecureVideoAdContainer);
  expect(index.VideoAdContainer).toBe(VideoAdContainer);
});
