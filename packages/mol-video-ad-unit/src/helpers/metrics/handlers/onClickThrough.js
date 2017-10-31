/* eslint-disable callback-return, promise/prefer-await-to-callbacks */
import {
  clickThrough
} from '../linearTrackingEvents';

const onClickThrough = ({videoElement, context, element}, callback) => {
  const {document} = context;
  const placeholder = element || videoElement.parentNode;
  const anchor = document.createElement('A');

  anchor.classList.add('mol-vast-clickthrough');
  anchor.href = '';
  anchor.style.width = '100%';
  anchor.style.height = '100%';
  anchor.style.position = 'absolute';

  anchor.onclick = (event) => {
    if (Event.prototype.stopPropagation !== undefined) {
      event.stopPropagation();
    }

    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();

      // TODO: do the click through
      callback(clickThrough);
    }
  };

  placeholder.insertBefore(anchor, videoElement);

  return () => {
    placeholder.removeChild(anchor);
  };
};

export default onClickThrough;

