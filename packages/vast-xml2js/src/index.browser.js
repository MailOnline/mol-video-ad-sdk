import xml2js from './helpers/xml2js';
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors';

/**
 * Parses the passed xml text.
 *
 * @ignore
 * @throws if there is an error parsing the xml.
 * @param {string} xmlText - XML text to be parsed.
 * @returns {Object} - Returns the parsed xml document as a js object.
 * @static
 */
const parseXml = (xmlText) => xml2js(DOMParser, xmlText);

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  parseXml
};
