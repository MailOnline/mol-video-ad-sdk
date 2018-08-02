/* eslint-disable promise/prefer-await-to-callbacks */
import debounce from 'lodash.debounce';
import isElementVisible from './helpers/isElementVisible';

let elementEntries = [];

const checkIsVisible = (entry) => {
  const {element, callback, lastInViewport, viewportOffset} = entry;
  const isInViewport = isElementVisible(element, viewportOffset);

  if (isInViewport !== lastInViewport) {
    entry.lastInViewport = isInViewport;

    // eslint-disable-next-line callback-return
    callback(isInViewport);
  }
};

const checkVisibility = () => {
  for (const entry of elementEntries) {
    checkIsVisible(entry);
  }
};

const validate = (target, callback) => {
  if (!(target instanceof Element)) {
    throw new TypeError('Target is not an Element node');
  }

  if (!(callback instanceof Function)) {
    throw new TypeError('Callback is not a function');
  }
};

const onElementVisibilityChange = function (target, callback, {threshold = 100, scrollableElement = window, viewabilityOffset = 0.4} = {}) {
  validate(target, callback);

  const viewportEventHandler = threshold > 0 ? debounce(checkVisibility) : checkVisibility;

  const entry = {
    callback,
    element: target,
    lastInViewport: false,
    scrollableElement,
    viewabilityOffset
  };

  checkIsVisible(entry);
  elementEntries.push(entry);

  scrollableElement.addEventListener('scroll', viewportEventHandler);

  if (elementEntries.length === 1) {
    window.addEventListener('resize', viewportEventHandler);
    window.addEventListener('orientationchange', viewportEventHandler);
    document.addEventListener('visibilitychange', viewportEventHandler);
  }

  return () => {
    elementEntries = elementEntries.filter((elementEntry) => elementEntry !== entry);

    if (elementEntries.length === 0) {
      window.removeEventListener('resize', viewportEventHandler);
      window.removeEventListener('orientationchange', viewportEventHandler);
      document.removeEventListener('visibilitychange', viewportEventHandler);
    }

    if (elementEntries.every((elementEntry) => elementEntry.scrollableElement !== scrollableElement)) {
      scrollableElement.removeEventListener('scroll', viewportEventHandler);
    }
  };
};

export default onElementVisibilityChange;
