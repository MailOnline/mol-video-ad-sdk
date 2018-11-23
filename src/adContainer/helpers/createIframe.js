import defer from '../../utils/defer';
import getContentDocument from './getContentDocument';
import getOrigin from './getOrigin';
import supportsSrcdoc from './supportsSrcdoc';

const iframeContent = (id, targetOrigin) => `<!DOCTYPE html>
<html>
  <head><meta charset='UTF-8'></head>
  <body style='margin:0;padding:0'>
  <script type='text/javascript'>window.parent.postMessage('${id}_ready', '${targetOrigin}');</script>
  </body>
</html>`;

const createIframe = (placeholder, id) => {
  const deferred = defer();
  const iframe = document.createElement('IFRAME');
  const content = iframeContent(id, getOrigin());

  iframe.sandbox = 'allow-forms allow-popups allow-scripts allow-same-origin';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.border = 'none';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.position = 'absolute';

  if (supportsSrcdoc()) {
    iframe.src = 'about:srcdoc';
    iframe.srcdoc = content;
    placeholder.appendChild(iframe);
  } else {
    iframe.src = 'about:blank';
    placeholder.appendChild(iframe);

    const iframeDocument = getContentDocument(iframe);

    if (iframeDocument) {
      iframeDocument.write(content);
    } else {
      placeholder.removeChild(iframe);
      deferred.reject(new Error('Error creating iframe, the placeholder is probably not in the DOM'));
    }
  }

  const handleMessage = ({data}) => {
    /* istanbul ignore else */
    if (data === `${id}_ready`) {
      window.removeEventListener('message', handleMessage);
      deferred.resolve(iframe);
    }
  };

  window.addEventListener('message', handleMessage, false);

  return deferred.promise;
};

export default createIframe;
