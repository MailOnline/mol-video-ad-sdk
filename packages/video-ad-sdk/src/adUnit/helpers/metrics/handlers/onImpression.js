/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents} from '@mol/video-ad-tracker';

const {impression} = linearEvents;

const onImpression = ({videoElement}, callback) => {
  const impressionHandler = () => {
    const currentTime = videoElement.currentTime;

    if (currentTime >= 2) {
      callback(impression);
      videoElement.removeEventListener('timeupdate', impressionHandler);
    }
  };

  videoElement.addEventListener('timeupdate', impressionHandler);

  return () => {
    videoElement.removeEventListener('timeupdate', impressionHandler);
  };
};

export default onImpression;
