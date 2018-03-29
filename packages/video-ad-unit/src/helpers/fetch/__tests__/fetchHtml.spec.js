import fetchHtml from '../fetchHtml';

[
  'text/plain',
  'text/html'
].forEach((contentType) => {
  test(`fetchHtml must resolve with the html fragment with content-type ${contentType}`, async () => {
    const htmlFragment = '<div></div>';
    const successResponse = {
      headers: {
        get: () => contentType
      },
      status: 200,
      text: () => htmlFragment
    };

    global.fetch = jest.fn(() => Promise.resolve(successResponse));

    const response = await fetchHtml('http://example.com');

    expect(response).toEqual(htmlFragment);
  });
});

test('fetchHtml must throw an error if the response\'s status is above 399', async () => {
  expect.assertions(2);
  const forbiddenResponse = {
    headers: {
      get: () => 'text/plain'
    },
    status: 403,
    statusText: 'forbidden request'
  };

  global.fetch = jest.fn(() => Promise.resolve(forbiddenResponse));

  try {
    await fetchHtml('http://example.com');
  } catch (error) {
    expect(error.message).toBe(forbiddenResponse.statusText);
    expect(error.response).toEqual(forbiddenResponse);
  }
});

test('fetchHtml must throw an error if the response\'s Content-Type is not valid', async () => {
  expect.assertions(2);
  const htmlFragment = '<div></div>';
  const invalidResponse = {
    headers: {
      get: () => 'text/json'
    },
    status: 200,
    text: () => htmlFragment
  };

  global.fetch = jest.fn(() => Promise.resolve(invalidResponse));

  try {
    await fetchHtml('http://example.com');
  } catch (error) {
    expect(error.message).toBe('fethHtml error, invalid Content-Type text/json');
    expect(error.response).toEqual(invalidResponse);
  }
});

