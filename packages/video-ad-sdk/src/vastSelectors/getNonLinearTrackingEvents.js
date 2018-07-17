import {
  get,
  getAll,
  getText,
  getAttributes
} from '@mol/vast-xml2js';
import getLinearCreative from './helpers/getLinearCreative';

const getNonLinearTrackingEvents = (ad, eventName) => {
  const creativeElement = ad && getLinearCreative(ad);

  if (creativeElement) {
    const NonLinearAdsElement = get(creativeElement, 'NonLinearAds');
    const trackingEventsElement = NonLinearAdsElement && get(NonLinearAdsElement, 'TrackingEvents');
    const trackinEventElements = trackingEventsElement && getAll(trackingEventsElement, 'Tracking');

    if (trackinEventElements && trackinEventElements.length > 0) {
      const trackingEvents = trackinEventElements.map((trackinEventElement) => {
        const {event} = getAttributes(trackinEventElement);
        const uri = getText(trackinEventElement);

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
