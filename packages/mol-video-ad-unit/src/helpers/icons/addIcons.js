import once from '../dom/once';
import renderIcons from './renderIcons';

const firstRenderPending = Symbol('firstRenderPending');
const noop = () => {};

const hasPendingIconRedraws = (icons, videoElement) => {
  const currentTimeInMs = videoElement.currentTime * 1000;
  const videoDurationInMs = videoElement.duration * 1000;

  const iconsPendingToBedrawn = icons
    .filter((icon) => !icon.offset || icon.offset < currentTimeInMs);
  const iconsPendingToBeRemoved = icons
    .filter((icon) => icon.duration && icon.duration < videoDurationInMs);

  return iconsPendingToBedrawn.length > 0 || iconsPendingToBeRemoved.length > 0;
};

const removeDrawnIcons = (icons) => icons
  .filter(({element}) => Boolean(element) && Boolean(element.parentNode))
  .forEach(({element}) => element.parentNode.removeChild(element));

const addIcons = (icons, {videoAdContainer, onIconView = noop, onIconClick = noop, ...rest} = {}) => {
  const {videoElement, element} = videoAdContainer;
  let finished = false;

  const drawIcons = async () => {
    if (finished) {
      return;
    }

    const drawnIcons = await renderIcons(icons, {
      onIconClick,
      videoAdContainer,
      ...rest
    });

    element.dispatchEvent(new CustomEvent('iconsdrawn'));

    drawnIcons.forEach((icon) => {
      if (icon[firstRenderPending]) {
        onIconView(icon);
        icon[firstRenderPending] = false;
      }
    });

    if (finished) {
      removeDrawnIcons(icons);
    }
  };

  icons.forEach((icon) => {
    icon[firstRenderPending] = true;
  });

  element.addEventListener('iconsdrawn', () => {
    if (hasPendingIconRedraws(icons, videoElement)) {
      once(videoElement, 'timeupdate', drawIcons);
    }
  });

  return {
    drawIcons,
    removeIcons: () => {
      finished = true;
      removeDrawnIcons(icons);
    }
  };
};

export default addIcons;
