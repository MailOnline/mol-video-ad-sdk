export const acceptInvitation = 'acceptInvitation';
export const adCollapse = 'adCollapse';
export const creativeView = 'creativeView';
export const close = 'close';

/**
 * List of event names that may be fired while trying to play a linear Ad.
 * @global
 * @typedef {Object} NonLinearEvents
 * @property {string} acceptInvitation - the user clicked or otherwise activated a control used to pause streaming content, which either expands the ad within the player’s viewable area or “takes-over” the streaming content area by launching an additional portion of the ad.
 * @property {string} adCollapse - the user activated a control to reduce the creative to its original dimensions.
 * @property {string} close - the user clicked or otherwise activated a control for removing the ad.
 * @property {string} creativeView - not to be confused with an impression, this event indicates that an individual creative portion of the ad was viewed.
 */
const nonLinearEvents = {
  acceptInvitation,
  adCollapse,
  close,
  creativeView
};

export default nonLinearEvents;
