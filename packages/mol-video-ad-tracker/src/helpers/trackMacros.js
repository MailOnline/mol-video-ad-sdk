import parseMacro from './parseMacro';

/**
 * Create a list of tracking images with the passed URL macros.
 *
 * @param {Array} URLMacros - Array of URL Macros that need to be tracked.
 * @param {Object} data - Data Object with the macros's variables.
 * @returns {Array} - Array of Image object whose sources are the parsed URLMacros.
 * @static
 */
const trackMacros = (URLMacros = [], data = {}) => {
  const sources = URLMacros.map((urlMacro) => parseMacro(urlMacro, data));

  return sources.map((source) => {
    const img = new Image();

    img.src = source;

    return img;
  });
};

export default trackMacros;

