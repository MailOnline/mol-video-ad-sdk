import once from '../dom/once';
import renderIcons from './renderIcons';

const canBeAdded = (icon, videoElement) => {
  const currentTimeInMs = videoElement.currentTime * 1000;
  const videoDurationInMs = videoElement.duration * 1000;
  const offset = icon.offset || 0;
  const duration = icon.duration || videoDurationInMs;

  return offset <= currentTimeInMs && currentTimeInMs - offset <= duration;
};

const hasToRedraw = (icons, videoElement) => icons.some((icon) => canBeAdded(icon, videoElement));

const removeDrawnIcons = (icons) => icons
  .filter(({element}) => Boolean(element) && Boolean(element.parentNode))
  .forEach(({element}) => element.parentNode.removeChild(element));

const addIcons = (icons, {videoAdContainer, ...rest}) => {
  const {videoElement, element} = videoAdContainer;
  let finished = false;

  const addIconsToAd = async () => {
    removeDrawnIcons(icons);

    if (finished) {
      return;
    }

    const iconsToDraw = icons.filter((icon) => canBeAdded(icon, videoElement));

    await renderIcons(iconsToDraw, {
      videoAdContainer,
      ...rest
    });

    element.dispatchEvent(new Event('iconsdrawn'));

    if (finished) {
      removeDrawnIcons(icons);

      return;
    }

    if (hasToRedraw(icons, videoElement)) {
      once(videoElement, 'timeupdate', addIconsToAd);
    }
  };

  addIconsToAd();

  return () => {
    finished = true;
    removeDrawnIcons(icons);
  };
};

export default addIcons;
