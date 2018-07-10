import getContentDocument from './getContentDocument';
import getOrigin from './getOrigin';

const defer = () => {
  const deferred = {};
  const promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  deferred.promise = promise;

  return deferred;
};

const createIframe = (placeholder, id) => {
  const deferred = defer();
  const iframe = document.createElement('IFRAME');

  iframe.src = 'about:blank';
  iframe.sandbox = 'allow-forms allow-popups allow-scripts';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.border = 'none';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.position = 'absolute';

  placeholder.appendChild(iframe);

  const iframeDocument = getContentDocument(iframe);

  if (iframeDocument) {
    const targetOrigin = getOrigin();
    const content = `<!DOCTYPE html>
                      <html lang="en">
                        <head><meta charset="UTF-8"></head>
                        <body style="margin:0;padding:0">
                        <script type="text/javascript">
                          window.parent.postMessage('${id}_ready', '${targetOrigin}');
                          </script>
                        </body>
                      </html>`;
    const handleMessage = ({data}) => {
      /* istanbul ignore else */
      if (data === `${id}_ready`) {
        window.removeEventListener('message', handleMessage);
        deferred.resolve(iframe);
      }
    };

    window.addEventListener('message', handleMessage, false);
    iframeDocument.write(content);
  } else {
    deferred.reject(new Error('Error creating iframe, the placeholder is probably not in the DOM'));
  }

  return deferred.promise;
};

export default createIframe;
