/* eslint-disable promise/always-return, promise/prefer-await-to-then */
import {debounce} from 'lodash/debounce';
import waitForNodeRemoval from './helpers/waitForNodeRemoval';
import isElementVisible from './helpers/isElementVisible';

let elementEntries = [];

const checkIsVisible = (entry) => {
  const {element, emit, lastInViewport, viewportOffset} = entry;
  const isInViewport = isElementVisible(element, viewportOffset);

  if (isInViewport !== lastInViewport) {
    entry.lastInViewport = isInViewport;
    emit(isInViewport);
  }
};

const onViewportEvent = debounce(() => {
  for (const entry of elementEntries) {
    checkIsVisible(entry);
  }
}, 100);

const checkViewability = (element, {emit, viewabilityOffset = 0.4, scrollableElement = window, logger = console}) => {
  const entry = {
    element,
    emit,
    lastInViewport: false,
    scrollableElement,
    viewabilityOffset
  };

  checkIsVisible(entry);
  elementEntries.push(entry);

  scrollableElement.addEventListener('scroll', onViewportEvent);

  if (elementEntries.length === 1) {
    window.addEventListener('resize', onViewportEvent);
    window.addEventListener('orientationchange', onViewportEvent);
    document.addEventListener('visibilitychange', onViewportEvent);
  }

  waitForNodeRemoval(element)
    .then(() => {
      elementEntries = elementEntries.filter((elementEntry) => elementEntry !== entry);

      if (elementEntries.length === 0) {
        window.removeEventListener('resize', onViewportEvent);
        window.removeEventListener('orientationchange', onViewportEvent);
        document.removeEventListener('visibilitychange', onViewportEvent);
      }

      if (!Boolean(elementEntries.find((elementEntry) => elementEntry.scrollableElement === scrollableElement))) {
        scrollableElement.removeEventListener('scroll', onViewportEvent);
      }
    })
    .catch((error) => logger.error(error));
};

export default checkViewability;
