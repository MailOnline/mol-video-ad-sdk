/**
 * Parses the passed macro with the passed data and returns the resulting parsed Macro.
 * If no CACHEBUSTING property is passed in the data it will generate a random one on its own.
 * If no TIMESTAMP property is passed in the data it will generate a one on its own.
 *
 * @param {string} macro - The string macro to be parsed.
 * @param {Object} data - The data used by the macro.
 * @returns {string} - The parsed macro.
 * @static
 */
const parseMacro = (macro, data) => {
  let parsedMacro = macro;

  if (!Boolean(data.CACHEBUSTING)) {
    data.CACHEBUSTING = Math.round(Math.random() * 1.0e+10);
  }

  if (!Boolean(data.TIMESTAMP)) {
    data.TIMESTAMP = new Date().toISOString();
  }

  Object.keys(data).forEach((key) => {
    const value = encodeURIComponent(data[key]);

    parsedMacro = parsedMacro.replace(new RegExp('\\[' + key + '\\]', 'gm'), value);
  });

  return parsedMacro;
};

export default parseMacro;
