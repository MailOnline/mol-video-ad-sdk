import createAdContainer from '../createAdContainer';

describe('createAdContainer', () => {
  test('must return a video ad container element', () => {
    const adContainer = createAdContainer();

    expect(adContainer).toMatchSnapshot();
  });
});
