import xml2js from './helpers/xml2js';
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors';

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
