/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents} from 'mol-video-ad-tracker';

const {
  playerCollapse,
  playerExpand
} = linearEvents;

const onFullscreenChange = ({context}, callback) => {
  const {document} = context;
  const fullscreenchangeHandler = () => {
    if (Boolean(document.fullscreenElement)) {
      callback(playerExpand);
    } else {
      callback(playerCollapse);
    }
  };

  document.addEventListener('fullscreenchange', fullscreenchangeHandler);

  return () => {
    document.removeEventListener('fullscreenchange', fullscreenchangeHandler);
  };
};

export default onFullscreenChange;
