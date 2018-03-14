import {
  get,
  getAll,
  getText,
  getAttributes
} from '@mol/vast-xml2js';
import parseOffset from './helpers/parseOffset';
import getLinearCreative from './helpers/getLinearCreative';

/**
 * VastTrackingEvent.
 * For more info please take a look at the [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
 *
 * @global
 * @typedef VastTrackingEvent
 * @type Object
 *
 * @property {string} [event] - A string that defines the event being track.
 * @property {ParsedOffset} [offset] - When the progress of the linear creative has matched the value specified, the included URI is triggered
 * @property {string} [uri] - A URI to the tracking resource for the event specified using the event attribute
 *
 */

const getLinearTrackingEvents = (ad, eventName) => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const linearElement = get(creativeElement, 'Linear');
    const trackingEventsElement = linearElement && get(linearElement, 'TrackingEvents');
    const trackinEventElements = trackingEventsElement && getAll(trackingEventsElement, 'Tracking');

    if (trackinEventElements && trackinEventElements.length > 0) {
      const trackingEvents = trackinEventElements.map((trackinEventElement) => {
        const {event, offset} = getAttributes(trackinEventElement);
        const uri = getText(trackinEventElement);

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
