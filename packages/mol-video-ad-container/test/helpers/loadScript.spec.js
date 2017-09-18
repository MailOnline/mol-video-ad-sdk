import loadScript from '../../src/helpers/loadScript';

test('loadScript complain if you don\'t pass a source', () => {
  expect(loadScript).toThrow(TypeError);
});

test('loadScript must return a promise', () => {
  expect(loadScript('http://example.com/script')).toBeInstanceOf(Promise);
});

test('loadScript load the script synchrounous by default', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {container});

  const script = container.querySelector('script');

  script.onload();

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(false);
  expect(script.defer).toEqual(false);
});

test('loadScript must be able to load script as defer', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    container,
    defer: true
  });

  const script = container.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(false);
  expect(script.defer).toEqual(true);
});

test('loadScript must be able to load script as async', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    async: true,
    container
  });

  const script = container.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.async).toEqual(true);
  expect(script.defer).toEqual(false);
});

test('loadScript set the type as \'text/javascript\' by default', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {container});

  const script = container.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.type).toEqual('text/javascript');
});

test('loadScript must be able to set a custom type for the script', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';

  loadScript(src, {
    container,
    type: 'txt/test'
  });

  const script = container.querySelector('script');

  expect(script.src).toEqual(src);
  expect(script.type).toEqual('txt/test');
});

test('loadScript must add the script to the given container', async () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';
  const promise = loadScript(src, {container});
  const script = container.querySelector('script');

  script.onload();

  expect(await promise).toBe(script);
});

test('loadScript must reject the promise if tere is an error loading the script', () => {
  const container = document.createElement('div');
  const src = 'http://example.com/script';
  const promise = loadScript(src, {container});
  const script = container.querySelector('script');

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
