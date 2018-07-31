/**
 * @module @mol/vast-xml2js
 * @description Simple wrapper on top of [xml-js](https://www.npmjs.com/package/xml-js) to ensure that is used on a consistent way and to make it easy to change in case is needed on the future.
 */
import xmldom from 'xmldom';
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
 * @throws if there is an error parsing the xml.
 * @param {string} xmlText - XML text to be parsed.
 * @returns {Object} - Returns the parsed xml document as a js object.
 * @static
 */
const parseXml = (xmlText) => xml2js(xmldom.DOMParser, xmlText);

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  parseXml
};
