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
import pixelTracker from '../../src/helpers/pixelTracker';
import trackError from '../../src/helpers/trackError';

jest.mock('../../src/helpers/pixelTracker', () => jest.fn());

afterEach(() => {
  pixelTracker.mockClear();
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

test('trackError must track the errors using pixelTracker fn', () => {
  trackError(vastChain, {errorCode: vastChain[0].errorCode});

  expect(pixelTracker).toHaveBeenCalledTimes(2);
  expect(pixelTracker).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {errorCode: 203});
  expect(pixelTracker).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {errorCode: 203});
});

test('trackError must accept an optional track funnction', () => {
  const mockTrack = jest.fn();

  trackError(vastChain, {
    errorCode: vastChain[0].errorCode,
    tracker: mockTrack
  });

  expect(pixelTracker).not.toHaveBeenCalled();
  expect(mockTrack).toHaveBeenCalledTimes(2);
  expect(mockTrack).toHaveBeenCalledWith(getVastErrorURI(noAdParsedXML), {errorCode: 203});
  expect(mockTrack).toHaveBeenCalledWith(getAdErrorURI(wrapperAd), {errorCode: 203});
});
