import {getCreativeData} from '../../../vastSelectors';
import viewmode from './viewmode';

const createSlot = (placeholder, width, height) => {
  const slot = document.createElement('DIV');

  slot.style.position = 'absolute';
  slot.style.top = '0px';
  slot.style.left = '0px';
  slot.style.border = '0px';
  slot.style.padding = '0px';
  slot.style.margin = '0px';
  slot.style.height = `${height}px`;
  slot.style.width = `${width}px`;
  slot.style.cursor = 'pointer';

  placeholder.appendChild(slot);

  return slot;
};
const initAd = (creativeAd, videoAdContainer, vastChain) => {
  const placeholder = videoAdContainer.element;
  const {width, height} = placeholder.getBoundingClientRect();
  const mode = viewmode(width, height);
  const desiredBitrate = -1;
  const environmentVars = {
    slot: createSlot(placeholder, width, height),
    videoSlot: videoAdContainer.videoElement,
    videoSlotCanAutoPlay: videoAdContainer.isOriginalVideoElement
  };
  const creativeData = getCreativeData(vastChain[0].XML);

  creativeAd.initAd(width, height, mode, desiredBitrate, creativeData, environmentVars);
};

export default initAd;
