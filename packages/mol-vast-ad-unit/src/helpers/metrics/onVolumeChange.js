/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {
  mute,
  unmute
} from './linearTrackingEvents';

const isMuted = (videoElement) => videoElement.muted || videoElement.volume === 0;

const onVolumeChange = ({videoElement}, callback) => {
  let wasMuted = isMuted(videoElement);

  const volumechangeHandler = () => {
    if (wasMuted && !isMuted(videoElement)) {
      callback(unmute);
    } else if (!wasMuted && isMuted(videoElement)) {
      callback(mute);
    }

    wasMuted = isMuted(videoElement);
  };

  videoElement.addEventListener('volumechange', volumechangeHandler);

  return () => {
    videoElement.removeEventListener('volumechange', volumechangeHandler);
  };
};

export default onVolumeChange;
