import {
  inlineAd,
  wrapperAd
} from 'mol-vast-fixtures';
import getIcons from '../src/getIcons';

test('getIcons must return null if there are no icons', () => {
  expect(getIcons()).toEqual(null);
  expect(getIcons(null)).toEqual(null);
  expect(getIcons({})).toEqual(null);
  expect(getIcons(wrapperAd)).toEqual(null);
});

test('getIcons must return the formatted icons', () => {
  expect(getIcons(inlineAd)).toEqual([
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
      duration: 30000,
      height: '20px',
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: 'https://test.example.com/iconClickTracking',
      iconViewTracking: 'https://test.example.com/iconViewTracking',
      offset: 5000,
      program: 'MOL_STATIC',
      pxratio: 1,
      staticResource: 'https://test.example.com/icon/staticResource',
      width: '20px',
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      duration: 30000,
      height: '20px',
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: 'https://test.example.com/iconClickTracking',
      iconViewTracking: 'https://test.example.com/iconViewTracking',
      offset: 5000,
      program: 'MOL_STATIC',
      pxratio: 2,
      staticResource: 'https://test.example.com/icon/staticResource',
      width: '20px',
      xPosition: 'right',
      yPosition: 'top'
    },
    {
      duration: 30000,
      height: '20px',
      htmlResource: 'https://test.example.com/icon/htmlResource',
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: 'https://test.example.com/iconClickTracking',
      iconViewTracking: 'https://test.example.com/iconViewTracking',
      offset: 5000,
      program: 'MOL_HTML',
      pxratio: 1,
      width: '20px',
      xPosition: 'left',
      yPosition: '20px'
    },
    {
      duration: undefined,
      height: '20px',
      iconClickThrough: 'https://test.example.com/iconClickThrough',
      iconClickTracking: 'https://test.example.com/iconClickTracking',
      iconViewTracking: 'https://test.example.com/iconViewTracking',
      iFrameResource: 'https://test.example.com/icon/iFrameResource',
      offset: undefined,
      program: 'MOL_IFRAME',
      pxratio: 1,
      width: '20px',
      xPosition: '10px',
      yPosition: '30px'}]);
});
