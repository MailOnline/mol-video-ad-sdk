import {
  get,
  getAll,
  getText,
  getAttributes
} from '../xml';
import getLinearCreative from './helpers/getLinearCreative';

/**
 * Gets the Non Linear tracking events from the Vast Ad
 *
 * @function
 * @param {ParsedAd} ad - VAST ad object.
 * @param {string} [eventName] - If provided it will filter-out the array events against it.
 * @returns {?Array.<VastTrackingEvent>} - Array of Tracking event definitions
 * @static
 * @ignore
 */
const getNonLinearTrackingEvents = (ad, eventName) => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const NonLinearAdsElement = get(creativeElement, 'NonLinearAds');
    const trackingEventsElement = NonLinearAdsElement && get(NonLinearAdsElement, 'TrackingEvents');
    const trackingEventElements = trackingEventsElement && getAll(trackingEventsElement, 'Tracking');

    if (trackingEventElements && trackingEventElements.length > 0) {
      const trackingEvents = trackingEventElements.map((trackingEventElement) => {
        const {event} = getAttributes(trackingEventElement);
        const uri = getText(trackingEventElement);

        return {
          event,
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

export default getNonLinearTrackingEvents;
