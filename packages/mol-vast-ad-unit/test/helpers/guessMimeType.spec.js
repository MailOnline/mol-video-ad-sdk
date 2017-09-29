/* eslint-disable id-match */
import guessMimeType from '../../src/helpers/guessMimeType';

test('guessMimeType must guess the mime of the passed source', () => {
  const mimeMap = {
    '3gp': 'video/3gpp',
    avi: 'video/x-msvideo',
    flv: 'video/x-flv',
    m3u8: 'application/x-mpegURL',
    m4v: 'video/mp4',
    mov: 'video/quicktime',
    mp4: 'video/mp4',
    mpd: 'application/dash+xml',
    ogv: 'video/ogg',
    ts: 'video/MP2T',
    unknown: 'video/unknown',
    webm: 'video/webm',
    wmv: 'video/x-ms-wmv'
  };

  Object.keys(mimeMap).forEach((ext) => {
    expect(guessMimeType(`/some/source.${ext}`)).toBe(mimeMap[ext]);
  });
});
