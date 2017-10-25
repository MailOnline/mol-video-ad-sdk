import once from '../dom/once';
import renderIcons from './renderIcons';

const canBeAdded = ({offset, duration}, currentTimeInMs) => {
  if (Boolean(offset) && offset > currentTimeInMs || Boolean(duration) && currentTimeInMs - offset > duration) {
    return false;
  }

  return true;
};

const hasToRedraw = (icons, currentTimeInMs, adDurationInMs) => icons.some(({duration, offset}) =>
  canBeAdded({
    duration: duration || adDurationInMs,
    offset: offset || 0
  }, currentTimeInMs));

const removeDrawnIcons = (icons) => icons
  .filter(({element}) => Boolean(element) && Boolean(element.parentNode))
  .forEach(({element}) => element.parentNode.removeChild(element));

const addIcons = (icons, {videoAdContainer, ...rest}) => {
  const {videoElement} = videoAdContainer;
  let finished = false;

  const addIconsToAd = async () => {
    removeDrawnIcons(icons);

    if (finished) {
      return;
    }

    const durationInMs = videoElement.duration * 1000;
    const currentTimeInMs = videoElement.currentTime * 1000;
    const iconsToDraw = icons.filter((icon) => canBeAdded(icon, currentTimeInMs));

    await renderIcons(iconsToDraw, {
      videoAdContainer,
      ...rest
    });

    if (finished) {
      removeDrawnIcons();

      return;
    }

    if (hasToRedraw(icons, currentTimeInMs, durationInMs)) {
      once('timeupdate', addIconsToAd);
    }
  };

  addIconsToAd();

  return () => {
    finished = true;
    removeDrawnIcons();
  };
};

export default addIcons;
