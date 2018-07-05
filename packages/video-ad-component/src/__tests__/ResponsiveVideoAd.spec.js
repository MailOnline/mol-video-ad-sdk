// eslint-disable-next-line import/no-extraneous-dependencies
import {mount} from 'enzyme';
import React from 'react';
import {
  onElementResize,
  onElementVisibilityChange
} from '../elementObservers';
import ResponsiveVideoAd from '../ResponsiveVideoAd';
import VideoAd from '../VideoAd';

jest.mock('../elementObservers', () => ({
  onElementResize: jest.fn(),
  onElementVisibilityChange: jest.fn()
}));

let resizeElement;
let simulateResize;
let simulateVisibilityChange;
const noop = () => {};

beforeEach(() => {
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  onElementResize.mockImplementation((element, callback) => {
    resizeElement = element;
    simulateResize = callback;
  });
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  onElementVisibilityChange.mockImplementation((element, callback) => {
    simulateVisibilityChange = callback;
  });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
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
    onStart: expect.any(Function),
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
    onStart: expect.any(Function),
    width: 150
  }));
});

test('must pause and resume the ad unit on visibility change', () => {
  const props = {
    getTag: noop,
    onStart: noop
  };
  const wrapper = mount(<ResponsiveVideoAd {...props} />);
  const videoAd = wrapper.find(VideoAd);
  const {onStart: simulateOnStart} = videoAd.props();
  const adUnitMock = {
    isFinished: () => false,
    pause: jest.fn(),
    resume: jest.fn()
  };

  expect(onElementVisibilityChange).not.toHaveBeenCalled();
  simulateOnStart({adUnit: adUnitMock});
  expect(onElementVisibilityChange).toHaveBeenCalledTimes(1);

  expect(adUnitMock.pause).toHaveBeenCalledTimes(0);
  expect(adUnitMock.resume).toHaveBeenCalledTimes(0);
  simulateVisibilityChange(false);
  expect(adUnitMock.pause).toHaveBeenCalledTimes(1);
  expect(adUnitMock.resume).toHaveBeenCalledTimes(0);
  simulateVisibilityChange(true);
  expect(adUnitMock.pause).toHaveBeenCalledTimes(1);
  expect(adUnitMock.resume).toHaveBeenCalledTimes(1);
});

test('must call onStart handler if passed', () => {
  const props = {
    getTag: noop,
    onStart: jest.fn()
  };
  const wrapper = mount(<ResponsiveVideoAd {...props} />);
  const videoAd = wrapper.find(VideoAd);
  const {onStart: simulateOnStart} = videoAd.props();
  const adUnitMock = {
    adUnit: {isFinished: () => false},
    changeVolume: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn()
  };

  expect(props.onStart).toHaveBeenCalledTimes(0);
  simulateOnStart(adUnitMock);
  expect(props.onStart).toHaveBeenCalledTimes(1);
  expect(props.onStart).toHaveBeenCalledWith(adUnitMock);
});
