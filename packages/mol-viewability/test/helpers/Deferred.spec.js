import Deferred from '../../src/helpers/Deferred';

test('Deferred must be give access to the promise and the reject and resolve promises', () => {
  const deferred = new Deferred();

  expect(deferred.promise).toBeInstanceOf(Promise);
  expect(deferred.resolve).toEqual(expect.any(Function));
  expect(deferred.reject).toEqual(expect.any(Function));
});

test('Deferred must be possible to to return the promise and resolve it', async () => {
  const {promise, resolve} = new Deferred();

  resolve('success');
  await expect(promise).resolves.toBe('success');
});

test('Deferred must be possible to to return the promise and reject it', async () => {
  const {promise, reject} = new Deferred();

  reject('error');
  await expect(promise).rejects.toBe('error');
});

