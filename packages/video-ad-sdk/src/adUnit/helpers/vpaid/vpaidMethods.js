export const handshakeVersion = 'handshakeVersion';
export const initAd = 'initAd';
export const resizeAd = 'resizeAd';
export const startAd = 'startAd';
export const stopAd = 'stopAd';
export const pauseAd = 'pauseAd';
export const resumeAd = 'resumeAd';
export const expandAd = 'expandAd';
export const collapseAd = 'collapseAd';

// NOTE: `skipAd` is not supported on VPAID 1.0 and since it is a convinent method that has proven problematic we have decided not to support custom skip control for vpaid creatives
// otherwise we risk showing the button twice if the creative is badly written and tell the sdk to show a custom skip control while showing its own control.
const vpaidMethods = [
  handshakeVersion,
  initAd,
  resizeAd,
  startAd,
  stopAd,
  pauseAd,
  resumeAd,
  expandAd,
  collapseAd
];

export default vpaidMethods;

