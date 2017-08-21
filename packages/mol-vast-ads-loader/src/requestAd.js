import xml2js from 'mol-vast-xml2js';
import {
  getFirstAd,
  getVASTAdTagURI,
  isWrapper
} from 'mol-vast-selectors';
import fetch from './helpers/fetch';

const DEFAULT_WRAPPER_LIMIT = 5;

const requestAd = async (adTag, options, vastChain = []) => {
  let VASTAdResponse = {
    ad: null,
    errorCode: null,
    parsedXML: null,
    requestTag: adTag,
    XML: null
  };

  if (vastChain.length > (options.wrapperLimit || DEFAULT_WRAPPER_LIMIT)) {
    VASTAdResponse.errorCode = 304;

    return [VASTAdResponse, ...vastChain];
  }

  let response;
  let XML;
  let parsedXML;
  let ad;

  try {
    response = await fetch(adTag, options);
    XML = await response.text();
    parsedXML = xml2js(XML, {compact: false});
    ad = getFirstAd(parsedXML);

    VASTAdResponse = {
      ad,
      errorCode: null,
      parsedXML,
      requestTag: adTag,
      XML
    };

    const newVastChain = [VASTAdResponse, ...vastChain];

    if (isWrapper(ad)) {
      return requestAd(getVASTAdTagURI(ad), options, newVastChain);
    }

    return newVastChain;
  } catch (error) {
    let errorCode = 900;

    if (!response || !XML) {
      errorCode = 502;
    } else if (!parsedXML) {
      errorCode = 100;
    } else if (!ad) {
      errorCode = 300;
    }

    VASTAdResponse.errorCode = errorCode;
    VASTAdResponse.error = error;

    return [VASTAdResponse, ...vastChain];
  }
};

export default requestAd;
