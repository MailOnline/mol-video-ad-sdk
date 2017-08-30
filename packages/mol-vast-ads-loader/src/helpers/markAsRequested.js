const markAsRequested = (ad) => {
  if (Boolean(ad)) {
    // eslint-disable-next-line id-match
    ad.___requested = true;
  }

  return ad;
};

export default markAsRequested;
