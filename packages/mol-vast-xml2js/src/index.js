import xml2js from 'xml-js/lib/xml2js';

/**
 * Parses the passed xml text.
 *
 * @param {string} xml - XML text to be parsed.
 * @returns {Object} - Returns the parsed xml as a js object.
 * @static
 */
export default (xml) => xml2js(xml, {compact: false});
