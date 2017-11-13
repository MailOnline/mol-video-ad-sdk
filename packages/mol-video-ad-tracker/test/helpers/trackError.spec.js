import {
  noAdParsedXML,
  vastNoAdXML,
  vastWrapperXML,
  wrapperParsedXML,
  wrapperAd
} from 'mol-vast-fixtures';
import {
  getAdErrorURI,
  getVastErrorURI
} from 'mol-vast-selectors';
import trackMacros from '../../src/helpers/trackMacros';
import trackError from '../../src/helpers/trackError';

jest.mock('../../src/helpers/trackMacros', () => jest.fn());

afterEach(() => {
  trackMacros.mockClear();
});

const vastChain = [
  {
    ad: null,
    error: expect.any(Error),
    errorCode: 203,
    parsedXML: noAdParsedXML,
    requestTag: 'https://test.example.com/vastadtaguri',
    XML: vastNoAdXML
  },
  {
    ad: wrapperAd,
    errorCode: null,
    parsedXML: wrapperParsedXML,
    requestTag: 'http://adtag.test.example.com',
    XML: vastWrapperXML
  }
];

test('trackError must track the errors using trackMacros fn', () => {
  trackError(vastChain);

  expect(trackMacros).toHaveBeenCalledTimes(2);
  expect(trackMacros).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {ERRORCODE: 203});
  expect(trackMacros).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {ERRORCODE: 203});
});

test('trackError must accept an optional track funnction', () => {
  const mockTrack = jest.fn();

  trackError(vastChain, mockTrack);

  expect(trackMacros).not.toHaveBeenCalled();
  expect(mockTrack).toHaveBeenCalledTimes(2);
  expect(mockTrack).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {ERRORCODE: 203});
  expect(mockTrack).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {ERRORCODE: 203});
});
