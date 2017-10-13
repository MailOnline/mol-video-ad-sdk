const createIframeResource = (src, {document, payload}) => {
  const {
    height,
    width
  } = payload;
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

