import parseMacro from './parseMacro';

/**
 * Create a tracking image with the passed URL macro.
 *
 * @param {string} URLMacro - URL Macro that need to be tracked.
 * @param {Object} data - Data Object with the macros's variables.
 * @returns {HTMLImageElement} - Image element whose source is the parsed URLMacro.
 * @static
 */
const pixelTracker = (URLMacro, data = {}) => {
  const img = new Image();

  img.src = parseMacro(URLMacro, data);

  return img;
};

export default pixelTracker;

