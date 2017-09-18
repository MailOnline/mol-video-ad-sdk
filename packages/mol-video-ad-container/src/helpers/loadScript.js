/**
 * Loads the script source.
 *
 * @param {string} src - The scrit source.
 * @param {Object} options - The allowed options are:
 *                           type: Defaults to 'text/javascript'.
 *                           async<Boolean> : if "true" the "async" attribute is added to the new script. Defaults to false.
 *                           defer<Boolean> : if "true" the "defer" attribute is added to the new script. Defaults to false.
 *                           container: Element that should contain the script. Defaults to the parentNode of the currentScript or if missing to document.head .
 */
const loadScript = function (src, {async = false, defer = false, type = 'text/javascript', container} = {}) {
  if (!src) {
    throw new TypeError('Missing required "src" parameter');
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let scriptContainer = container;

    script.type = type;
    script.async = async;
    script.defer = defer;
    script.onerror = () => reject(new URIError(`The script ${src} is not accessible.`));
    script.onload = () => resolve(script);

    if (!scriptContainer) {
      scriptContainer = document.currentScript ? document.currentScript.parentNode : document.head;
    }

    scriptContainer.appendChild(script);
    script.src = src;
  });
};

export default loadScript;
