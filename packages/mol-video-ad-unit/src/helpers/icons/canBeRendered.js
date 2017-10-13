/* eslint-disable no-shadow */
const calculateArea = (element) => {
  const {
    height,
    width
  } = element.getBoundingClientRect();

  return height * width;
};

export const hasSpace = (newIcon, config) => {
  const {
    drawnIcons,
    placeholder
  } = config;
  const placeholderArea = calculateArea(placeholder);
  const iconArea = calculateArea(newIcon.element);
  const usedIconsArea = drawnIcons.reduce((accumulator, icon) => accumulator + icon.element, 0);

  return iconArea + usedIconsArea <= placeholderArea * 0.35;
};

export const withinBoundaries = (newIcon) => {
  const {
    left,
    top
  } = newIcon;

  return left >= 0 && top >= 0;
};

const right = ({left, width}) => left + width;
const left = ({left}) => left;
const top = ({top}) => top;
const bottom = ({top, height}) => top + height;
const overlap = (newIcon, drawnIcon) => left(newIcon) > right(drawnIcon) ||
  right(newIcon) < left(drawnIcon) ||
  bottom(newIcon) < top(drawnIcon) ||
  top(newIcon) > bottom(drawnIcon);

export const withoutOverlaps = (newIcon, {drawnIcons}) => !drawnIcons.some((drawnIcon) => overlap(newIcon, drawnIcon));

const canBeRendered = (newIcon, config) => hasSpace(newIcon, config) && withinBoundaries(newIcon) && withoutOverlaps(newIcon, config);

export default canBeRendered;
