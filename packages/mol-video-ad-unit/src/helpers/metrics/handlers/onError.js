/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents} from 'mol-video-ad-tracker';

const {error} = linearEvents;

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
