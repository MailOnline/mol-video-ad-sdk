/* eslint-disable callback-return, promise/prefer-await-to-callbacks */
import {
  skip
} from '../linearTrackingEvents';

const createDefaultSkipControl = (document) => {
  const skipBtn = document.createElement('BUTTON');

  skipBtn.classList.add('mol-vast-skip-control');
  skipBtn.type = 'button';
  skipBtn.value = 'skip';
  skipBtn.style.position = 'absolute';
  skipBtn.style.botton = '10px';
  skipBtn.style.right = '0px';

  return skipBtn;
};

// TODO: WHAT HAPPEN WITH THE HOOK IN ADUNIT
const onSkip = (videoAdContainer, callback, {skipoffset, createSkipControl = createDefaultSkipControl} = {}) => {
  if (!Boolean(skipoffset)) {
    return () => {};
  }

  let skipControl;
  const {
    videoElement,
    element,
    context
  } = videoAdContainer;
  const {document} = context;

  const skipHandler = () => {
    const currentTimeMs = videoElement.currentTime * 1000;

    if (!Boolean(skipControl) && currentTimeMs >= skipoffset) {
      skipControl = createSkipControl(document);

      skipControl.onclick = (event) => {
        if (Event.prototype.stopPropagation !== undefined) {
          event.stopPropagation();
        }

        callback(skip);

        return false;
      };

      element.appendChild(skipControl);
      videoElement.removeEventListener('timeupdate', skipHandler);
    }
  };

  videoElement.addEventListener('timeupdate', skipHandler);

  return () => {
    videoElement.removeEventListener('timeupdate', skipHandler);
    if (Boolean(skipControl)) {
      element.removeChild(skipControl);
    }
  };
};

export default onSkip;
