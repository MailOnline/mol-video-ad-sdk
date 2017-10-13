import createResource from '../resources/createResource';

const loadIcon = (payload, {document, placeholder}) => new Promise((resolve, reject) => {
  const iconElement = createResource(document, payload);

  iconElement.addEventListener('error', reject);
  iconElement.addEventListener('load', () => {
    placeholder.removeChild(iconElement);
    iconElement.style.zIndex = 0;
    resolve(iconElement);
  });

  // Some browsers will not load the resource if they are not added to the DOM
  iconElement.style.zIndex = -9999;
  placeholder.appendChild(iconElement);
});

export default loadIcon;
