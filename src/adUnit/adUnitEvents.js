/**
 * Fires when the adUnit's volume has changed.
 *
 * @event VideoAdUnit#volumeChanged
 */
export const volumeChanged = 'volumeChanged';

/**
 * Fires when the adUnit's has finished.
 *
 * @event VideoAdUnit#finish
 */
export const finish = 'finish';

/**
 * fired when the ad .
 *
 * @event VideoAdUnit#adProgress
 */
export const adProgress = 'adProgress';

const adUnitEvents = {
  adProgress,
  finish,
  volumeChanged
};

export default adUnitEvents;

