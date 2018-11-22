import {getCreativeData} from '../../../vastSelectors';
import viewmode from './viewmode';

const initAd = (creativeAd, videoAdContainer, vastChain) => {
  const placeholder = videoAdContainer.element;
  const {width, height} = placeholder.getBoundingClientRect();
  const mode = viewmode(width, height);
  const desiredBitrate = -1;
  const environmentVars = {
    slot: placeholder,
    videoSlot: videoAdContainer.videoElement
  };
  const creativeData = getCreativeData(vastChain[0].XML);

  creativeAd.initAd(width, height, mode, desiredBitrate, creativeData, environmentVars);
};

export default initAd;
