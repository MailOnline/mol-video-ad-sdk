/* eslint-disable promise/prefer-await-to-then */
import renderIcon from './renderIcon';

const renderIcons = (icons, {onIconClick, videoAdContainer, logger}) => {
  const {
    context,
    element
  } = videoAdContainer;
  const document = context.document;
  const drawnIcons = [];

  return icons.reduce((promise, icon) => promise
    .then(() => renderIcon(icon, {
      document,
      drawnIcons,
      onIconClick,
      placeholder: element
    }))
    .then((renderedIcon) => drawnIcons.push(renderedIcon))
    .catch((error) => logger.error(error))
    , Promise.resolve(drawnIcons))
    .then(() => drawnIcons);
};

export default renderIcons;
