/** @module vast-xml2js */
import xml2js from 'xml-js/lib/xml2js';
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors';

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
};

/**
 * Parses the passed xml text.
 *
 * @param {string} xml - XML text to be parsed.
 * @returns {Object} - Returns the parsed xml as a js object.
 * @static
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default (xml) => xml2js(xml, {compact: false});
