import defer from '../../../utils/defer';

// TODO: ONCE VPAID AD UNIT IS FINISH, REVIEW IF THE TIMEOUT IS NEEDED IN THE END
const waitFor = (creativeAd, event, timeout) => {
  // eslint-disable-next-line prefer-const
  let timeoutId;
  const deferred = defer();
  const handler = () => {
    if (typeof timeout === 'number') {
      clearTimeout(timeoutId);
    }

    creativeAd.unsubscribe(handler, event);
    deferred.resolve();
  };

  if (typeof timeout === 'number') {
    timeoutId = setTimeout(() => {
      creativeAd.unsubscribe(handler, event);
      deferred.reject(new Error(`Timeout waiting for event '${event}'`));
    }, timeout);
  }

  creativeAd.subscribe(handler, event);

  return deferred.promise;
};

export default waitFor;
