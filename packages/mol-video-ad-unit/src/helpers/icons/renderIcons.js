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
    .catch((error) => logger.error(error))
    .then(() => renderIcon(icon, {
      document,
      drawnIcons,
      onIconClick,
      placeholder: element
    }))
    .then((renderedIcon) => drawnIcons.push(renderedIcon))
    , Promise.resolve(drawnIcons))
    .then(() => drawnIcons);
};

export default renderIcons;
