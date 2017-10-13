const createHtmlResource = (src, {document, payload}) => {
  const {
    height,
    width
  } = payload;
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
