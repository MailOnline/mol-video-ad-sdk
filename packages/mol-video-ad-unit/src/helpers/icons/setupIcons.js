import retrieveIcons from './retrieveIcons';
import addIcons from './addIcons';

const setupIcons = (vastChain, {logger, onIconClick, onIconView, videoAdContainer}) => {
  const icons = retrieveIcons(vastChain);

  if (icons) {
    return addIcons(icons, {
      logger,
      onIconClick,
      onIconView,
      videoAdContainer
    });
  }

  return () => {};
};

export default setupIcons;
