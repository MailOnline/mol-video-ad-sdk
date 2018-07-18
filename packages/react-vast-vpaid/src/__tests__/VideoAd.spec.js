// eslint-disable-next-line import/no-extraneous-dependencies
import {mount} from 'enzyme';
import React from 'react';
import {runWaterfall} from '@mol/video-ad-sdk';
import VideoAd from '../VideoAd';

const mockAdUnit = {
  cancel: jest.fn(),
  isFinished: jest.fn(),
  onError: jest.fn(),
  onFinish: jest.fn(),
  pause: jest.fn(),
  resize: jest.fn(),
  resume: jest.fn(),
  setVolume: jest.fn()
};

const Spinner = () => <div className='spinner' />;

jest.mock('@mol/video-ad-sdk', () => ({runWaterfall: jest.fn()}));

const getTag = () => 'http://fakeTestTagUrl';

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
  runWaterfall.mockImplementation(() => Promise.resolve(mockAdUnit));
});

test('must display the children until it is ready to start the ad', (done) => {
  expect.assertions(2);
  // eslint-disable-next-line prefer-const
  let wrapper;

  const onStart = () => {
    expect(wrapper.html().includes('spinner')).toBe(false);

    done();
  };

  wrapper = mount(<div>
    <VideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('onStart must pass the adUnit and some convenience methods', (done) => {
  expect.assertions(8);

  const onStart = ({adUnit, setVolume, pause, resume}) => {
    expect(adUnit).toBe(mockAdUnit);
    expect(adUnit.setVolume).toHaveBeenCalledTimes(0);
    expect(adUnit.pause).toHaveBeenCalledTimes(0);
    expect(adUnit.resume).toHaveBeenCalledTimes(0);
    setVolume();
    expect(adUnit.setVolume).toHaveBeenCalledTimes(1);
    pause();
    expect(adUnit.pause).toHaveBeenCalledTimes(1);
    resume();
    expect(adUnit.resume).toHaveBeenCalledTimes(1);
    done();
  };

  const wrapper = mount(<div>
    <VideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must call onError with isRecoverable flag set to false when an adUnit has an error', (done) => {
  expect.assertions(5);
  const onError = jest.fn();

  const onStart = () => {
    const error = new Error('boom');
    const simulateError = mockAdUnit.onError.mock.calls[0][0];

    expect(onError).toHaveBeenCalledTimes(0);
    expect(mockAdUnit.onError).toHaveBeenCalledTimes(1);
    simulateError(error);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(error.isRecoverable).toBe(false);

    done();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onError={onError}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);
});

test('must resize the adUnit if the width or the height of the component changes', () => {
  expect.assertions(2);

  const wrapper = mount(
    <VideoAd
      getTag={getTag}
      height={10}
      width={20}
    >
      <Spinner />
    </VideoAd>);

  expect(wrapper.find('div').first().props().style).toEqual({
    height: '10px',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '20px'
  });

  wrapper.setProps({
    height: null,
    width: null
  });
  expect(wrapper.find('div').first().props().style).toEqual({
    height: '100%',
    left: '0',
    position: 'absolute',
    top: '0',
    width: '100%'
  });
});

test('must on unmount cancel the adUnit', (done) => {
  expect.assertions(3);
  // eslint-disable-next-line prefer-const
  let wrapper;

  mockAdUnit.isFinished.mockImplementation(() => false);
  const onStart = () => {
    expect(mockAdUnit.cancel).toHaveBeenCalledTimes(0);
    wrapper.unmount();
    process.nextTick(() => {
      expect(mockAdUnit.cancel).toHaveBeenCalledTimes(1);
      done();
    });
  };

  wrapper = mount(<div>
    <VideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must not cancel the ad unit on unmount if the adUnit has already finished', (done) => {
  expect.assertions(3);
  // eslint-disable-next-line prefer-const
  let wrapper;

  mockAdUnit.isFinished.mockImplementation(() => true);
  const onStart = () => {
    expect(mockAdUnit.cancel).toHaveBeenCalledTimes(0);
    wrapper.unmount();
    process.nextTick(() => {
      expect(mockAdUnit.cancel).toHaveBeenCalledTimes(0);
      done();
    });
  };

  wrapper = mount(<div>
    <VideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must call onFinish once the adUnit is finished', (done) => {
  expect.assertions(2);

  const onFinish = jest.fn();
  const onStart = () => {
    const simulateComplete = mockAdUnit.onFinish.mock.calls[0][0];

    simulateComplete();
    expect(mockAdUnit.onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(1);

    done();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onFinish={onFinish}
      onStart={onStart}
    >
      <Spinner />
    </VideoAd>
  </div>);
});

test('must call onError with isRecoverable flag set to false if there is a problem starting the ad', (done) => {
  expect.assertions(2);

  const error = new Error('boom');

  runWaterfall.mockImplementation(() => {
    throw error;
  });
  const onError = (err) => {
    expect(err).toEqual(error);
    expect(err.isRecoverable).toBe(false);
    done();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onError={onError}
    >
      <Spinner />
    </VideoAd>
  </div>);
});