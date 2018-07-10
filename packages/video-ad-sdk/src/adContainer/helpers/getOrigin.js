const getOrigin = () => {
  const location = window.location;

  /* istanbul ignore if */
  if (location.origin) {
    return location.origin;
  } else {
    return location.protocol + '//' +
          location.hostname +
          /* istanbul ignore next */
          (location.port ? ':' + location.port : '');
  }
};

export default getOrigin;
