const createStaticResource = (src, {document, payload}) => {
  const {
    height,
    width
  } = payload;
  const img = document.createElement('IMG');

  if (width) {
    img.style.width = width;
  }

  if (height) {
    img.style.height = height;
  }

  img.src = src;

  return img;
};

export default createStaticResource;
