import {
  inlineAd,
  wrapperAd
} from '../../../fixtures';
import getIcons from '../getIcons';

test('getIcons must return null if there are no icons', () => {
  expect(getIcons()).toEqual(null);
  expect(getIcons(null)).toEqual(null);
  expect(getIcons({})).toEqual(null);
});

test('getIcons must return the formatted icons', () => {
  expect(getIcons(wrapperAd)).toEqual([
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
    },
    {
      duration: undefined,
      height: undefined,
      iconClickThrough: undefined,
      iconClickTracking: undefined,
      offset: undefined,
      program: undefined,
      pxratio: undefined,
      staticResource: 'https://test.example.com/icon/staticResource',
      width: undefined,
      xPosition: 'right',
      yPosition: 'top'
    }
  ]);

  expect(getIcons(inlineAd)).toEqual([
    {
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
    },
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
    }
  ]);
});
