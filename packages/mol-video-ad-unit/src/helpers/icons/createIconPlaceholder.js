const createIconPlaceholder = (document) => {
  const placeholder = document.createElement('DIV');

  placeholder.classList.add('mol-video-ad-icon-placeholder');
  placeholder.style.position = 'absolute';
  placeholder.style.top = '0';
  placeholder.style.left = '0';
  placeholder.style.width = '100%';
  placeholder.style.height = '100%';

  return placeholder;
};

export default createIconPlaceholder;
