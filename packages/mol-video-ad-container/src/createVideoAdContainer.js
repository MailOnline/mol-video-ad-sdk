import SecureVideoAdContainer from './SecureVideoAdContainer';
import VideoAdContainer from './VideoAdContainer';

const createVideoAdContainer = (placeholder, options = {}) => {
  const {secure = false} = options;

  if (secure) {
    return new SecureVideoAdContainer(placeholder, options).ready();
  }

  return new VideoAdContainer(placeholder, options).ready();
};

export default createVideoAdContainer;
