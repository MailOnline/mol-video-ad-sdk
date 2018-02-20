import {createVideoAdContainer} from '@mol/video-ad-container';
import renderIcons from '../../../src/helpers/icons/renderIcons';
import renderIcon from '../../../src/helpers/icons/renderIcon';
import canBeShown from '../../../src/helpers/icons/canBeShown';

jest.mock('../../../src/helpers/icons/renderIcon');
jest.mock('../../../src/helpers/icons/canBeShown');

let videoAdContainer;
let logger;
let icons;

beforeEach(async () => {
  videoAdContainer = await createVideoAdContainer(document.createElement('DIV'));
  logger = {
    log: jest.fn()
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
  canBeShown.mockImplementation(() => true);
});

afterEach(() => {
  videoAdContainer = null;
  logger = null;
  icons = null;
});

test('renderIcons must filterout the icons that can not be shown due to their offset or duration', () => {
  const iconElement = document.createElement('DIV');

  icons[0].element = iconElement;
  videoAdContainer.element.appendChild(iconElement);
  canBeShown.mockImplementation(() => false);

  expect(renderIcons(icons, {
    logger,
    videoAdContainer
  })).resolves.toEqual([]);

  expect(iconElement.parentNode).toBe(null);
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

  expect(logger.log).toHaveBeenCalledTimes(1);
  expect(logger.log).toHaveBeenCalledWith(renderError);
});
