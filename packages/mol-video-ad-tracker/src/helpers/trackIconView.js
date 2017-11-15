import pixelTracker from './pixelTracker';

const trackIconView = (vastChain, {data, tracker = pixelTracker} = {}) => {
  const {iconViewTracking} = data;

  if (Boolean(iconViewTracking)) {
    tracker(iconViewTracking, {...data});
  }
};

export default trackIconView;
