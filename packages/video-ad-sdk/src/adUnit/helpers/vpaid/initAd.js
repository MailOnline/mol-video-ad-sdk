import {getAdParameters} from '../../../vastSelectors';
import viewmode from './viewmode';

const initAd = (creativeAd, videoAdContainer, vastChain) => {
  const placeholder = videoAdContainer.element;
  const {width, height} = placeholder.getBoundingClientRect();
  const mode = viewmode(width, height);
  const desiredBitrate = -1;
  const creativeData = getAdParameters(vastChain[0].ad);
  const environmentVars = {
    slot: placeholder,
    videoSlot: videoAdContainer.videoElement
  };

  creativeAd.initAd(width, height, mode, desiredBitrate, creativeData, environmentVars);
};

export default initAd;
