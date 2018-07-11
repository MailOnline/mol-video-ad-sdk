const viewmode = (width, height) => {
  const isFullscreen = width + 100 > innerWidth && height + 100 > innerHeight;

  if (isFullscreen) {
    return 'fullscreen';
  }

  if (width < 400) {
    return 'thumbnail';
  }

  return 'normal';
};

export default viewmode;
