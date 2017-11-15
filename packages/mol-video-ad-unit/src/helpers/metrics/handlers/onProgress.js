/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents} from 'mol-video-ad-tracker';
import formatProgress from '../../utils/formatProgress';

const {progress} = linearEvents;
const secondsToMilliseconds = (seconds) => seconds * 1000;

// TODO: PROGRESS SHOULD BE TRIGGERED PER EVENT
const onProgress = ({videoElement}, callback) => {
  const previousCurrentTime = secondsToMilliseconds(videoElement.currentTime);
  let playedMs = 0;

  const progressHandler = () => {
    const {currentTime, duration} = videoElement;
    const durationInMs = secondsToMilliseconds(duration);
    const delta = Math.abs(currentTime - previousCurrentTime);

    playedMs += secondsToMilliseconds(delta);

    callback(progress, {
      contentplayhead: formatProgress(playedMs),
      playedMs,
      playedPercentage: playedMs * 100 / durationInMs
    });
  };

  videoElement.addEventListener('timeupdate', progressHandler);

  return () => {
    videoElement.removeEventListener('timeupdate', progressHandler);
  };
};

export default onProgress;
