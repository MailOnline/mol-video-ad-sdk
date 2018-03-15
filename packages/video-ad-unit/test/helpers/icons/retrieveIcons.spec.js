import {
  wrapperAd,
  inlineAd
} from '@mol/vast-fixtures';
import retrieveIcons from '../../../src/helpers/icons/retrieveIcons';

beforeEach(() => {
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    writable: true
  });
});

test('retrieveIcons must return null if there are no icons on the vastAdChain', () => {
  expect(retrieveIcons([{ad: {}}])).toEqual(null);
});

test('retrieveIcons must return the icons filtering out the duplicates and just one per program', () => {
  const icons = retrieveIcons([
    {ad: inlineAd},
    {ad: inlineAd},
    {ad: wrapperAd},
    {ad: wrapperAd}
  ]);

  expect(icons).toEqual([
    {
      duration: 30000,
      height: 20,
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: expect.arrayContaining(['https://test.example.com/iconClickTracking']),
      iconViewTracking: expect.arrayContaining(['https://test.example.com/iconViewTracking']),

      offset: 5000,
      program: 'MOL_STATIC',
      pxratio: 2,
      staticResource: 'https://test.example.com/icon/staticResource2',
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      duration: 30000,
      height: 20,
      htmlResource: 'https://test.example.com/icon/htmlResource',
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: expect.arrayContaining(['https://test.example.com/iconClickTracking']),
      iconViewTracking: expect.arrayContaining(['https://test.example.com/iconViewTracking']),

      offset: 5000,
      program: 'MOL_HTML',
      pxratio: 1,
      width: 20,
      xPosition: 'left',
      yPosition: 20
    },
    {
      duration: undefined,
      height: 20,
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: expect.arrayContaining(['https://test.example.com/iconClickTracking']),
      iconViewTracking: expect.arrayContaining(['https://test.example.com/iconViewTracking']),

      iFrameResource: 'https://test.example.com/icon/iFrameResource',
      offset: undefined,
      program: 'MOL_IFRAME',
      pxratio: 1,
      width: 20,
      xPosition: 10,
      yPosition: 30
    },
    {
      duration: undefined,
      height: undefined,
      iconClickThrough: undefined,
      iconClickTracking: undefined,
      offset: undefined,
      program: undefined,
      pxratio: undefined,
      staticResource: 'http://adchoices.com',
      width: undefined,
      xPosition: 'right',
      yPosition: 'top'
    }
  ]);
});

test('retrieveIcons must filter the icons taking the pxratio into account', () => {
  window.devicePixelRatio = 3;
  let icons = retrieveIcons([
    {ad: inlineAd},
    {ad: inlineAd},
    {ad: wrapperAd},
    {ad: wrapperAd}
  ]);

  expect(icons).toEqual(expect.arrayContaining([
    {
      duration: 30000,
      height: 20,
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: expect.arrayContaining(['https://test.example.com/iconClickTracking']),
      iconViewTracking: expect.arrayContaining(['https://test.example.com/iconViewTracking']),

      offset: 5000,
      program: 'MOL_STATIC',
      pxratio: 2,
      staticResource: 'https://test.example.com/icon/staticResource2',
      width: 20,
      xPosition: 'right',
      yPosition: 'top'
    }
  ]));

  window.devicePixelRatio = 1;
  icons = retrieveIcons([
    {ad: inlineAd},
    {ad: inlineAd},
    {ad: wrapperAd},
    {ad: wrapperAd}
  ]);

  const molStaticIcons = icons.filter(({program}) => program === 'MOL_STATIC');

  expect(molStaticIcons.length).toBe(1);
  expect(molStaticIcons[0]).toEqual(expect.objectContaining({
    duration: 30000,
    height: 20,
    iconClickThrough: 'https://test.example.com/iconClickThrough',
    iconClickTracking: expect.arrayContaining(['https://test.example.com/iconClickTracking']),
    iconViewTracking: expect.arrayContaining(['https://test.example.com/iconViewTracking']),

    offset: 5000,
    program: 'MOL_STATIC',
    pxratio: 1,
    staticResource: 'https://test.example.com/icon/staticResource',
    width: 20,
    xPosition: 'right',
    yPosition: 'top'
  }));
});

