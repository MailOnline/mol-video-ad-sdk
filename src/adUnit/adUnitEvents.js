/**
 * Fires when the adUnit's volume has changed.
 *
 * @event VpaidAdUnit#volumeChanged
 */
export const volumeChanged = 'volumeChanged';

/**
 * Fires when the adUnit's has finished.
 *
 * @event VpaidAdUnit#finish
 */
export const finish = 'finish';

const adUnitEvents = {
  finish,
  volumeChanged
};

export default adUnitEvents;

