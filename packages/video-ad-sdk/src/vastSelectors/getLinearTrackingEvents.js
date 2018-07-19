import {
  get,
  getAll,
  getText,
  getAttributes
} from '@mol/vast-xml2js';
import parseOffset from './helpers/parseOffset';
import getLinearCreative from './helpers/getLinearCreative';

/**
 * Gets the Linear tracking events from the Vast Ad
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @param {string} [eventName] - If provided it will filter-out the array events against it.
 * @returns {?Array.<VastTrackingEvent>} - Array of Tracking event definitions
 * @static
 * @ignore
 */
const getLinearTrackingEvents = (ad, eventName) => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const linearElement = get(creativeElement, 'Linear');
    const trackingEventsElement = linearElement && get(linearElement, 'TrackingEvents');
    const trackingEventElements = trackingEventsElement && getAll(trackingEventsElement, 'Tracking');

    if (trackingEventElements && trackingEventElements.length > 0) {
      const trackingEvents = trackingEventElements.map((trackingEventElement) => {
        const {event, offset} = getAttributes(trackingEventElement);
        const uri = getText(trackingEventElement);

        return {
          event,
          offset: offset && parseOffset(offset),
          uri
        };
      });

      if (eventName) {
        const filteredEvents = trackingEvents.filter(({event}) => event === eventName);

        if (filteredEvents.length > 0) {
          return filteredEvents;
        }
      } else {
        return trackingEvents;
      }
    }
  }

  return null;
};

export default getLinearTrackingEvents;
