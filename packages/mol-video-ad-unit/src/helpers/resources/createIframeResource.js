const createIframeResource = (src, {document, data}) => {
  const {
    height,
    width
  } = data;
  const iframeElement = document.createElement('IFRAME');

  iframeElement.src = src;
  iframeElement.sandbox = 'allow-forms allow-popups allow-scripts';

  if (width) {
    iframeElement.width = width;
  }

  if (height) {
    iframeElement.height = height;
  }

  iframeElement.src = src;

  return iframeElement;
};

export default createIframeResource;

