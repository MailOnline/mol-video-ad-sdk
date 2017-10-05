/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import formatProgress from '../formatProgress';
import {
  progress
} from './linearTrackingEvents';

const secondsToMilliseconds = (seconds) => seconds * 1000;

const onProgress = (videoElement, callback) => {
  const previousCurrentTime = secondsToMilliseconds(videoElement.currentTime);
  let accumulatedProgress = 0;

  const progresshandler = () => {
    const currentTime = videoElement.currentTime;
    const delta = Math.abs(currentTime - previousCurrentTime);

    accumulatedProgress += secondsToMilliseconds(delta);

    callback(progress, {
      accumulated: accumulatedProgress,
      contentplayhead: formatProgress(accumulatedProgress)
    });
  };

  videoElement.addEventListener('timeupdate', progresshandler);

  return () => {
    videoElement.removeEventListener('timeupdate', progresshandler);
  };
};

export default onProgress;
