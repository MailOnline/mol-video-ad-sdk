import document from './helpers/document';
import window from './helpers/window';

/**
 * Checks if the passed element is visible.
 *
 * @param {DOMElement} element - The DOMElement to check is visible.
 * @param {number} viewabilityOffsetFraction - Offset fraction. Specifies the percentage of the element that needs to be hidden to be considered not vissible.
 * @returns {boolean} - True if the element is visible or false otherwise.
 */
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
