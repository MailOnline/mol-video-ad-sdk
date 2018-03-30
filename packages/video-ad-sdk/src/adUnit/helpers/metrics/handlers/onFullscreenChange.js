/* eslint-disable promise/prefer-await-to-callbacks, callback-return */
import {linearEvents} from '../../../../tracker';

const {
  fullscreen,
  exitFullscreen,
  playerCollapse,
  playerExpand
} = linearEvents;

const onFullscreenChange = ({context}, callback) => {
  const {document} = context;
  const fullscreenchangeHandler = () => {
    if (Boolean(document.fullscreenElement)) {
      callback(playerExpand);
      callback(fullscreen);
    } else {
      callback(playerCollapse);
      callback(exitFullscreen);
    }
  };

  document.addEventListener('fullscreenchange', fullscreenchangeHandler);

  return () => {
    document.removeEventListener('fullscreenchange', fullscreenchangeHandler);
  };
};

export default onFullscreenChange;
