import {createVastAdUnit} from 'mol-video-ad-unit';

/*
  VPAID LINEAR TRACKING EVENTS

  * acceptInvitationLinear, <= Not used in VAST maybe for VPAID
  * otherAdInteraction, <= Not used in VAST maybe for VPAID?
  * timeSpentViewing, <= Not used in VAST maybe for VPAID?

  VAST LINEAR TRACKING EVENTS

  * clickThrough, <= emit called with eventName and adUint
  * complete,  <= emit called with eventName and adUint
  * error, <= it will be called with an error object or undefined
  * firstQuartile,  <= emit called with eventName and adUint
  * iconClick, <= emit called with eventName, adUnit, iconDefinition
  * iconView, <= emit called with eventName, adUnit, iconDefinition
  * impression,  <= emit called with eventName and adUint
  * midpoint,  <= emit called with eventName and adUint
  * mute, <= emit called with eventName and adUint
  * pause,  <= emit called with eventName and adUint
  * playerCollapse, <= emit called with eventName and adUint
  * playerExpand, <= emit called with eventName and adUint
  * progress, <= emit called with eventName, adUint and {accumulated: NUMBER, contentplayhead: FORMATED_STRING}
  * resume, <= emit called with eventName and adUint
  * rewind, <= emit called with eventName and adUint
  * skip, <= emit called with eventName and adUint
  * start, <= emit called with eventName and adUint
  * thirdQuartile,  <= emit called with eventName and adUint
  * unmute <= emit called with eventName and adUint
  */

const createVideoAdUnit = async (vastChain, videoAdContainer, options = {}) => {
  const adUnit = await createVastAdUnit(vastChain, videoAdContainer, options);

  // TODO: DO THE TRACKING OF THE ADUNIT ALLOWING AN OPTIONAL TRACK FUNCTION
  return adUnit;
};

export default createVideoAdUnit;

