import parseMacro from './parseMacro';

const pixelTracker = (URLMacro, data) => {
  const img = new Image();

  img.src = parseMacro(URLMacro, data);

  return img;
};

export default pixelTracker;

