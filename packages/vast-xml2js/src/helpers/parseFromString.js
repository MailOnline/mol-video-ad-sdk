import saneError from 'sane-domparser-error';

const parseFromString = (DOMParser, xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  saneError.failOnParseError(doc);

  return doc;
};

export default parseFromString;

