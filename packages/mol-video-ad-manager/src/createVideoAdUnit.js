import {createVastAdUnit} from 'mol-video-ad-unit';

const createVideoAdUnit = async (vastChain, videoAdContainer, options = {}) => {
  // const {track} = options;
  const adUnit = await createVastAdUnit(vastChain, videoAdContainer, options);

  // TODO: DO THE TRACKING OF THE ADUNIT ALLOWING AN OPTIONAL TRACK FUNCTION
  return adUnit;
};

export default createVideoAdUnit;

