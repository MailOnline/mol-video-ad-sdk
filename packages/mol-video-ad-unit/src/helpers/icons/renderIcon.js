import loadResource from '../resources/loadResource';
import updateIcon from './updateIcon';
import canBeRendered from './canBeRendered';

const wrapWithClickThrough = (iconElement, icon, {onIconClick}) => {
  const anchor = document.createElement('A');

  // TODO: Test iconClickthrough logic
  if (icon.iconClickthrough) {
    anchor.href = icon.iconClickthrough;
    anchor.target = '_blank';
  }

  anchor.onclick = (event) => {
    if (Event.prototype.stopPropagation !== undefined) {
      event.stopPropagation();
    }

    onIconClick(icon);
  };

  anchor.appendChild(iconElement);

  return anchor;
};

const createIcon = async (icon, config) => {
  if (!icon.element) {
    const iconElement = await loadResource(icon, config);

    iconElement.height = '100%';
    iconElement.width = '100%';

    icon.element = wrapWithClickThrough(iconElement, icon, config);
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
