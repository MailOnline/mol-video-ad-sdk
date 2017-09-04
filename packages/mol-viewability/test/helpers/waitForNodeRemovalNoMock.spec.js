import waitForNodeRemoval from '../../src/helpers/waitForNodeRemoval';

test('watiForNodeRemoval must reject the promise if the MutationObserver API is not supported', async () => {
  const node = document.createElement('div');

  await expect(waitForNodeRemoval(node)).rejects.toEqual(expect.any(Error));
});
