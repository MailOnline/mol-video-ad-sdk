import {createVideoAdContainer} from 'mol-video-ad-container';
import renderIcons from '../../../src/helpers/icons/renderIcons';
import renderIcon from '../../../src/helpers/icons/renderIcon';

jest.mock('../../../src/helpers/icons/renderIcon');

let videoAdContainer;
let logger;
let icons;

beforeEach(async () => {
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  logger = {
    error: jest.fn()
  };
  icons = [
    {
      height: 3,
      width: 5
    },
    {

      height: 3,
      width: 5
    }
  ];
});

afterEach(() => {
  videoAdContainer = null;
  logger = null;
  icons = null;
});

test('renderIcons must render the passed icons and return an array with the rendered icon definitions updated', () => {
  const updatedIcon = {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  };

  renderIcon.mockImplementation(() => Promise.resolve(updatedIcon));

  expect(renderIcons(icons, {
    logger,
    videoAdContainer
  })).resolves.toEqual([
    updatedIcon,
    updatedIcon
  ]);
});

test('renderIcons must log an error if an icon failed to render and return the other icons', async () => {
  const updatedIcon = {
    height: 3,
    left: 6,
    top: 0,
    width: 5
  };

  const renderError = new Error('Error rendering the icon');

  renderIcon
    .mockImplementationOnce(() => Promise.reject(renderError))
    .mockImplementationOnce(() => Promise.resolve(updatedIcon));

  const renderedIcons = await renderIcons(icons, {
    logger,
    videoAdContainer
  });

  expect(renderedIcons).toEqual([
    updatedIcon
  ]);

  expect(logger.error).toHaveBeenCalledTimes(1);
  expect(logger.error).toHaveBeenCalledWith(renderError);
});
