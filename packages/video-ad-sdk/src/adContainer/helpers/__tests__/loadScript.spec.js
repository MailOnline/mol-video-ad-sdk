import loadScript from '../loadScript';

test('loadScript complain if you don\'t pass a source', () => {
  expect(loadScript).toThrow(TypeError);
});

test('loadScript must return a promise', () => {
  expect(loadScript('http://example.com/script')).toBeInstanceOf(Promise);
});

test('loadScript load the script synchronous by default', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {placeholder});

  const script = placeholder.querySelector('script');

  script.onload();

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(false);
  expect(script.defer).toEqual(false);
});

test('loadScript must be able to load script as defer', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    defer: true,
    placeholder
  });

  const script = placeholder.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(false);
  expect(script.defer).toEqual(true);
});

test('loadScript must be able to load script as async', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    async: true,
    placeholder
  });

  const script = placeholder.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(true);
  expect(script.defer).toEqual(false);
});

test('loadScript set the type as \'text/javascript\' by default', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {placeholder});

  const script = placeholder.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.type).toEqual('text/javascript');
});

test('loadScript must be able to set a custom type for the script', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    placeholder,
    type: 'txt/test'
  });

  const script = placeholder.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.type).toEqual('txt/test');
});

test('loadScript must add the script to the given placeholder', async () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';
  const promise = loadScript(src, {placeholder});
  const script = placeholder.querySelector('script');

  script.onload();

  expect(await promise).toBe(script);
});

test('loadScript must reject the promise if there is an error loading the script', () => {
  const placeholder = document.createElement('div');
  const src = 'http://example.com/script';
  const promise = loadScript(src, {placeholder});
  const script = placeholder.querySelector('script');

  script.onerror();

  expect(promise).rejects.toEqual(expect.any(URIError));
});

test('loadScript if no document.currentScript must add the script to the document.head', async () => {
  const src = 'http://example.com/script';
  const promise = loadScript(src);
  const scripts = document.head.querySelectorAll('script');
  const script = scripts[scripts.length - 1];

  script.onload();

  expect(await promise).toBe(script);
});
