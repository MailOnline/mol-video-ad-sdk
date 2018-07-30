/* eslint-disable filenames/match-regex, id-match */
import parseFromString from './parseFromString';
import xmlToJson from './xmlToJson';

const xml2js = (DOMParser, xmlText) => {
  const xmlDom = parseFromString(DOMParser, xmlText);

  return xmlToJson(xmlDom);
};

export default xml2js;
