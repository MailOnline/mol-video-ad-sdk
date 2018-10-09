import defer from '../../utils/defer';
import getOrigin from './getOrigin';

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

  iframe.src = `javascript: '${content}'`;
  iframe.srcdoc = content;
  iframe.sandbox = 'allow-forms allow-popups allow-scripts';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.border = 'none';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.position = 'absolute';

  placeholder.appendChild(iframe);

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
