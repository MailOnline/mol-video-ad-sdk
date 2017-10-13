/* eslint-disable promise/prefer-await-to-then */
import renderIcon from './renderIcon';

const renderIcons = (icons, {placeholder, videoAdContainer, logger}) => {
  const {
    context
  } = videoAdContainer;
  const document = context.document;
  const drawnIcons = [];

  return icons.reduce((promise, icon) => promise
    .catch((error) => logger.error(error))
    .then(() => renderIcon(icon, {
      document,
      drawnIcons,
      placeholder
    }))
    .then((renderedIcon) => drawnIcons.push(renderedIcon))
    , Promise.resolve());
};

export default renderIcons;
