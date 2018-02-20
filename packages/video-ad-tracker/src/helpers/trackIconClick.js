import pixelTracker from './pixelTracker';

const trackIconClick = (vastChain, {data, tracker = pixelTracker} = {}) => {
  const {iconClickTracking} = data;

  if (Boolean(iconClickTracking)) {
    tracker(iconClickTracking, {...data});
  }
};

export default trackIconClick;
