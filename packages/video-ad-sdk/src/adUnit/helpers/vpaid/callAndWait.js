import waitFor from './waitFor';

const callAndWait = (creativeAd, method, event) => {
  const waitPromise = waitFor(creativeAd, event, 3000);

  creativeAd[method]();

  return waitPromise;
};

export default callAndWait;
