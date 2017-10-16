import loadIcon from './loadIcon';
import updateIcon from './updateIcon';
import canBeRendered from './canBeRendered';

const createIcon = async (icon, config) => {
  if (!icon.element) {
    icon.element = await loadIcon(icon, config);
  }

  return icon.element;
};

const updateIconElement = (iconElement, icon) => {
  const {
    height,
    width,
    left,
    top
  } = icon;

  iconElement.height = height;
  iconElement.width = width;
  iconElement.style.position = 'absolute';
  iconElement.style.left = `${left}px`;
  iconElement.style.top = `${top}px`;
  iconElement.style.height = `${height}px`;
  iconElement.style.width = `${width}px`;

  return iconElement;
};

const renderIcon = async (icon, config) => {
  const {placeholder} = config;
  const iconElement = await createIcon(icon, config);
  const updatedIcon = updateIcon(icon, iconElement, config);

  if (canBeRendered(updatedIcon, config)) {
    placeholder.appendChild(updateIconElement(iconElement, updatedIcon));
  } else {
    throw new Error('Icon can\'t be rendered');
  }

  return updatedIcon;
};

export default renderIcon;
