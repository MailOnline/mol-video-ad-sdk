/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {
  error
} from '../linearTrackingEvents';

const onError = ({videoElement}, callback) => {
  const errorHandler = () => {
    callback(error);
  };

  videoElement.addEventListener('error', errorHandler);

  return () => {
    videoElement.removeEventListener('error', errorHandler);
  };
};

export default onError;
