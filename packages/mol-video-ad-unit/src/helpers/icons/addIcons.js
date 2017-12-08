import once from '../dom/once';
import renderIcons from './renderIcons';

const firstRenderPending = Symbol('firstRenderPending');
const noop = () => {};
const canBeAdded = (icon, videoElement) => {
  const currentTimeInMs = videoElement.currentTime * 1000;
  const videoDurationInMs = videoElement.duration * 1000;
  const offset = icon.offset || 0;
  const duration = icon.duration || videoDurationInMs;

  return offset <= currentTimeInMs && currentTimeInMs - offset <= duration;
};

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
    removeDrawnIcons(icons);

    if (finished) {
      return;
    }

    const iconsToDraw = icons.filter((icon) => canBeAdded(icon, videoElement));
    const drawnIcons = await renderIcons(iconsToDraw, {
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

      return;
    }

    if (hasPendingIconRedraws(icons, videoElement)) {
      // TODO: change logic to prevent unnecessary redraws
      once(videoElement, 'timeupdate', drawIcons);
    }
  };

  icons.forEach((icon) => {
    icon[firstRenderPending] = true;
  });

  // TODO: SHOULD PROVIDE A WAY TO RECALCULATE THE DRAWN ICONS BUT NOT DO IT BY DEFAULT
  const stopResizeHandler = videoAdContainer.onResize(drawIcons);

  drawIcons();

  return () => {
    finished = true;
    removeDrawnIcons(icons);
    stopResizeHandler();
  };
};

export default addIcons;
