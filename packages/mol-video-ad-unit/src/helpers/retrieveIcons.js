import {getIcons} from 'mol-vast-selectors';

const UNKNOWN = 'UNKNOWN';
const uniqBy = (array, uniqValue) => {
  const seen = {};

  return array.filter((item) => {
    const key = uniqValue(item);

    if (seen.hasOwnProperty(key)) {
      return false;
    }

    seen[key] = true;

    return true;
  });
};

const getResource = ({
  staticResource,
  htmlResource,
  iFrameResource
}) => staticResource || htmlResource || iFrameResource;

const uniqByResource = (icons) => uniqBy(icons, getResource);

const groupIconsByProgram = (icons) => icons.reduce((accumulator, icon) => {
  const {
    program = UNKNOWN
  } = icon;

  if (!accumulator[program]) {
    accumulator[program] = [];
  }

  accumulator[program].push(icon);

  return accumulator;
}, {});

const sortIconByBestPxratio = (icons) => {
  const devivePixelRatio = Window.devicePixelRatio || 0;

  const compareTo = (iconA, iconB) => {
    const deltaA = Math.abs(devivePixelRatio - (iconA.pxratio || 0));
    const deltaB = Math.abs(devivePixelRatio - (iconB.pxratio || 0));

    return deltaA - deltaB;
  };

  return icons.slice(0).sort(compareTo);
};

const chooseByPxRatio = (icons) => {
  if (icons.length === 1) {
    return icons[0];
  }

  return sortIconByBestPxratio(icons)[0];
};

const chooseIcons = (icons) => {
  const byProgram = groupIconsByProgram(icons);
  const programs = Object.keys(byProgram);

  return programs.reduce((accumulator, program) => {
    if (program === UNKNOWN) {
      return [
        ...accumulator,
        ...byProgram[UNKNOWN]
      ];
    }

    return [
      ...accumulator,
      chooseByPxRatio(byProgram[program])
    ];
  }, []);
};

const retrieveIcons = (vastChain) => {
  const ads = vastChain.map(({ad}) => ad);
  const icons = ads.reduce((accumulator, ad) => [
    ...accumulator,
    ...getIcons(ad) || []
  ], []);
  const uniqIcons = uniqByResource(icons);

  return chooseIcons(uniqIcons);
};

export default retrieveIcons;
