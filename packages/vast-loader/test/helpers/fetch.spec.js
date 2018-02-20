import fetch from '../../src/helpers/fetch';

test('fetch must add credentials \'include\' to the request options', async () => {
  const successResponse = {status: 200};

  global.fetch = jest.fn(() => Promise.resolve(successResponse));

  const response = await fetch('http://example.com');

  expect(global.fetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({credentials: 'include'}));
  expect(response).toEqual(successResponse);
});

test('fetch must throw an error if the response\'s status is above 399', async () => {
  const forbiddenResponse = {
    status: 403,
    statusText: 'forbidden request'
  };

  global.fetch = jest.fn(() => Promise.resolve(forbiddenResponse));

  try {
    await fetch('http://example.com');

    throw new Error('should have thrown already');
  } catch (error) {
    expect(error.message).toBe(forbiddenResponse.statusText);
    expect(error.response).toEqual(forbiddenResponse);
  }
});
