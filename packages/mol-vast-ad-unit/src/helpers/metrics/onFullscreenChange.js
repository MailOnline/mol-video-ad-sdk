/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {
  playerCollapse,
  playerExpand
} from './linearTrackingEvents';

const onFullscreenChange = (document, callback) => {
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
