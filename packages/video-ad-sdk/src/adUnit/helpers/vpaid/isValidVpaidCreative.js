// NOTE: skipAd is not part of the method list because it only appears in VPAID 2.0 and we support VPAID 1.0
export const VPAID_CREATIVE_METHODS = [
  'handshakeVersion', 'initAd', 'startAd', 'stopAd', 'resizeAd', 'pauseAd', 'expandAd', 'collapseAd', 'subscribe', 'unsubscibe'
];

const isValidVpaidCreative = (creative) => VPAID_CREATIVE_METHODS.every((method) => typeof creative[method] === 'function');

export default isValidVpaidCreative;
