import xml2js from 'xml-js/lib/xml2js';
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
 * @param {string} xml - XML text to be parsed.
 * @returns {Object} - Returns the parsed xml as a js object.
 * @static
 */
const parseXml = (xml) => xml2js(xml, {compact: false});

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  parseXml
};
