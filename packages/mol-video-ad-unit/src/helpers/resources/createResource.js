import createHtmlResource from './createHtmlResource';
import createIframeResource from './createIframeResource';
import createStaticResource from './createStaticResource';

const createResource = (document, payload) => {
  const {
    staticResource,
    htmlResource,
    iframeResource
  } = payload;

  if (Boolean(staticResource)) {
    return createStaticResource(staticResource, {
      document,
      payload
    });
  }

  if (Boolean(htmlResource)) {
    return createHtmlResource(htmlResource, {
      document,
      payload
    });
  }

  return createIframeResource(iframeResource, {
    document,
    payload
  });
};

export default createResource;
