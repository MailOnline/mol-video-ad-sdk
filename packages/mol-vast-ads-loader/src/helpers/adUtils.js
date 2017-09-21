const requested = Symbol('requested');

export const markAdAsRequested = (ad) => {
  if (Boolean(ad)) {
    ad[requested] = true;
  }

  return ad;
};

export const unmarkAdAsRequested = (ad) => {
  delete ad[requested];
};

export const hasAdBeenRequested = (ad) => Boolean(ad[requested]);
