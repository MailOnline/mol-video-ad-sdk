// eslint-disable-next-line import/no-namespace
import * as index from '../src/index';
import createVideoAdContainer from '../src/createVideoAdContainer';
import SecureVideoAdContainer from '../src/SecureVideoAdContainer';
import VideoAdContainer from '../src/VideoAdContainer';

test('index must publish the factory and the 2 classes', () => {
  expect(index.createVideoAdContainer).toBe(createVideoAdContainer);
  expect(index.SecureVideoAdContainer).toBe(SecureVideoAdContainer);
  expect(index.VideoAdContainer).toBe(VideoAdContainer);
});
