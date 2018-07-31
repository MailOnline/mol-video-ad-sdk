import xml2js from './helpers/xml2js';
import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute
} from './helpers/xmlSelectors';

const parser = new DOMParser();
const parseXml = (xmlText) => xml2js(parser, xmlText);

export {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  parseXml
};
