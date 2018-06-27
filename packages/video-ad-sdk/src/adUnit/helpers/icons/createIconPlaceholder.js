// TODO: CHECK IF THIS IS NEEDED

const createIconPlaceholder = (document) => {
  const placeholder = document.createElement('DIV');

  placeholder.classList.add('mol-video-ad-icon-placeholder');
  placeholder.style.position = 'absolute';
  placeholder.style.top = '0px';
  placeholder.style.left = '0px';
  placeholder.style.width = '100%';
  placeholder.style.height = '100%';

  return placeholder;
};

export default createIconPlaceholder;
