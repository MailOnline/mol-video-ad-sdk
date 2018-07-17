import createVideoAdContainer from '../../../../adContainer/createVideoAdContainer';
import renderIcons from '../renderIcons';
import renderIcon from '../renderIcon';
import canBeShown from '../canBeShown';

jest.mock('../renderIcon');
jest.mock('../canBeShown');

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

test('renderIcons must filter out the icons that can not be shown due to their offset or duration', () => {
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
