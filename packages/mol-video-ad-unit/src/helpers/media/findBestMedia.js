import {getMediaFiles} from 'mol-vast-selectors';
import canPlay from './canPlay';
import sortMediaByBestFit from './sortMediaByBestFit';

const findBestMedia = (inlineAd, videoElement, container) => {
  const screenRect = container.getBoundingClientRect();
  const mediaFiles = getMediaFiles(inlineAd);

  if (mediaFiles) {
    const suportedMediaFiles = mediaFiles.filter((mediaFile) => canPlay(videoElement, mediaFile));
    const sortedMediaFiles = sortMediaByBestFit(suportedMediaFiles, screenRect);

    return sortedMediaFiles[0];
  }

  return null;
};

export default findBestMedia;
