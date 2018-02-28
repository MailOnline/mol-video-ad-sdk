import document from './document';
import window from './window';

const isElementVisible = function (element, viewabilityOffsetFraction = 0) {
  const {
    height,
    width,
    top,
    right,
    bottom,
    left
  } = element.getBoundingClientRect();

  if (!height || !width) {
    return false;
  }

  const verticalOffset = height * (1 - viewabilityOffsetFraction);
  const horizontalOffset = width * (1 - viewabilityOffsetFraction);
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return !document.hidden &&
    top + verticalOffset >= 0 &&
    bottom - verticalOffset <= viewportHeight &&
    left + horizontalOffset >= 0 &&
    right - horizontalOffset <= viewportWidth;
};

export default isElementVisible;
