const isCustomXposition = (xPosition) => !['left', 'right'].includes(xPosition.toLowerCase());
const isCustomYPosition = (yPosition) => !['top', 'bottom'].includes(yPosition.toLowerCase());
const calculateIconLeft = (dynamicPos, iconWidth, drawnIcons, placeholder) => {
  const icons = drawnIcons.filter((icon) => icon.xPosition === dynamicPos);
  const drawnIconsWidth = icons.reduce((accumulator, icon) => accumulator + icon.width, 0);

  if (dynamicPos === 'left') {
    return drawnIconsWidth;
  }

  return placeholder.getBoundingClientRect().width - drawnIconsWidth - iconWidth;
};

const calculateIconTop = (dynamicPos, iconHeight, placeholder) => {
  if (dynamicPos === 'top') {
    return 0;
  }

  return placeholder.getBoundingClientRect().height - iconHeight;
};

const updateIcon = (icon, iconElement, {drawnIcons, placeholder}) => {
  const rect = iconElement.getBoundingClientRect();
  const width = icon.width || rect.width;
  const height = icon.height || rect.height;
  const xPosition = icon.xPostion || 'right';
  const yPosition = icon.yPosition || 'top';
  let left;
  let top;

  if (isCustomXposition(xPosition)) {
    left = xPosition;
  } else {
    left = calculateIconLeft(xPosition, width, drawnIcons, placeholder);
  }

  if (isCustomYPosition(yPosition)) {
    top = yPosition;
  } else {
    top = calculateIconTop(yPosition, height, placeholder);
  }

  return Object.assign({}, icon, {
    height,
    left,
    top,
    width
  });
};

export default updateIcon;
