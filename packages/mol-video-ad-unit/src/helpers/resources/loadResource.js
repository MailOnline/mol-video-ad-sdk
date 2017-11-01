import createResource from './createResource';

const loadResource = (icon, {document, placeholder}) => new Promise((resolve, reject) => {
  try {
    const iconElement = createResource(document, icon);

    iconElement.addEventListener('error', () => {
      placeholder.removeChild(iconElement);
      iconElement.style.zIndex = 0;
      reject(new Error('Error loading icon'));
    });

    iconElement.addEventListener('load', () => {
      placeholder.removeChild(iconElement);
      iconElement.style.zIndex = 0;
      resolve(iconElement);
    });

    // Some browsers will not load the resource if they are not added to the DOM
    iconElement.style.zIndex = -9999;
    placeholder.appendChild(iconElement);
  } catch (error) {
    reject(error);
  }
});

export default loadResource;