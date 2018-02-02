import makeCancelable from '../../src/helpers/makeCancelable';

test('must given a promise return a promise controller', () => {
  const controller = makeCancelable(Promise.resolve());

  expect(controller.cancel).toBeInstanceOf(Function);
  expect(controller.isPending).toBeInstanceOf(Function);
  expect(controller.promise).toBeInstanceOf(Promise);
});

test('must be possible to know if the promise is pending', async () => {
  const {isPending, promise} = makeCancelable(Promise.resolve());

  expect(isPending()).toBe(true);

  await promise;

  expect(isPending()).toBe(false);
});

test('must be possible to cancel the promise', async () => {
  const {cancel, promise} = makeCancelable(Promise.resolve());

  cancel();

  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Promise was canceled');
  }
});

test('wrapper promise must resolve with the passed promise result value', () => {
  const {promise} = makeCancelable(Promise.resolve('success'));

  expect(promise).resolves.toBe('success');

  const rejectError = new Error('rejected');
  const {promise: newPromise} = makeCancelable(Promise.reject(rejectError));

  expect(newPromise).rejects.toBe(rejectError);
});
