const loadCreative = async ({src, type}, videoAdContainer) => {
  await videoAdContainer.addScript(src, {type});

  const context = videoAdContainer.executionContext;

  return context.getVPAIDAd();
};

export default loadCreative;
