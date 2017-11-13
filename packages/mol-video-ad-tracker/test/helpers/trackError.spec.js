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
import macrosTracker from '../../src/helpers/macrosTracker';
import trackError from '../../src/helpers/trackError';

jest.mock('../../src/helpers/macrosTracker', () => jest.fn());

afterEach(() => {
  macrosTracker.mockClear();
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

test('trackError must track the errors using macrosTracker fn', () => {
  trackError(vastChain);

  expect(macrosTracker).toHaveBeenCalledTimes(2);
  expect(macrosTracker).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {ERRORCODE: 203});
  expect(macrosTracker).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {ERRORCODE: 203});
});

test('trackError must accept an optional track funnction', () => {
  const mockTrack = jest.fn();

  trackError(vastChain, {tracker: mockTrack});

  expect(macrosTracker).not.toHaveBeenCalled();
  expect(mockTrack).toHaveBeenCalledTimes(2);
  expect(mockTrack).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {ERRORCODE: 203});
  expect(mockTrack).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {ERRORCODE: 203});
});
