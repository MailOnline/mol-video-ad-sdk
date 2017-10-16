const createHtmlResource = (src, {document, data}) => {
  const {
    height,
    width
  } = data;
  const iframeElement = document.createElement('IFRAME');

  iframeElement.src = src;
  iframeElement.sandbox = 'allow-forms';

  if (width) {
    iframeElement.width = width;
  }

  if (height) {
    iframeElement.height = height;
  }

  iframeElement.src = src;

  return iframeElement;
};

export default createHtmlResource;
