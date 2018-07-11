import loadCreative from './loadCreative';
import handshake from './handshake';

const init = async (creative, videoAdContainer) => {
  const creativeAd = await loadCreative(creative, videoAdContainer);

  handshake(creativeAd, '2.0');

  return creativeAd;
};

export default init;
