// eslint-disable-next-line import/no-extraneous-dependencies
import {mount} from 'enzyme';
import React from 'react';
import {onElementResize} from '@mol/element-observers';
import ResponsiveVideoAd from '../src/ResponsiveVideoAd';
import VideoAd from '../src/VideoAd';

jest.mock('@mol/element-observers', () => ({
  onElementResize: jest.fn()
}));

let resizeElement;
let simulateResize;
const noop = () => {};

beforeEach(() => {
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  onElementResize.mockImplementation((element, callback) => {
    resizeElement = element;
    simulateResize = callback;
  });
});
afterEach(() => {
  onElementResize.mockReset();
  onElementResize.mockClear();
});

test('ResponsiveVideoAd must propagate the props to the VideoAd component', () => {
  const props = {
    getTag: noop,
    onStart: noop
  };
  let wrapper = mount(<ResponsiveVideoAd {...props} />);
  let videoAd = wrapper.find(VideoAd);

  expect(videoAd.length).toBe(1);
  expect(videoAd.props()).toEqual(expect.objectContaining({
    ...props,
    height: 0,
    width: 0
  }));

  expect(onElementResize).toHaveBeenCalledTimes(1);

  Object.defineProperty(resizeElement, 'clientWidth', {
    value: 150,
    writable: true
  });

  Object.defineProperty(resizeElement, 'clientHeight', {
    value: 100,
    writable: true
  });

  simulateResize();

  wrapper = wrapper.update();
  videoAd = wrapper.find(VideoAd);

  expect(videoAd.props()).toEqual(expect.objectContaining({
    ...props,
    height: 100,
    width: 150
  }));
});
