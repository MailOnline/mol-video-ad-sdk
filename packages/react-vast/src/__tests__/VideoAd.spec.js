// eslint-disable-next-line import/no-extraneous-dependencies
import {mount} from 'enzyme';
import React from 'react';
import VideoAd from '../VideoAd';
import tryToStartAd from '../helpers/tryToStartAd';

let mockAdUnit;

const Spinner = () => <div className='spinner' />;

jest.mock('../helpers/tryToStartAd');

const getTag = () => 'http://fakeTestTagUrl';

beforeEach(() => {
  mockAdUnit = {
    cancel: jest.fn(),
    changeVolume: jest.fn(),
    isFinished: jest.fn(),
    onComplete: jest.fn(),
    onError: jest.fn(),
    pause: jest.fn(),
    resize: jest.fn(),
    resume: jest.fn()
  };

  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
  tryToStartAd.mockImplementation(() => Promise.resolve(mockAdUnit));
});

test('must renderLoading() until it is ready to start the ad', (done) => {
  expect.assertions = 2;
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
      renderLoading={() => <Spinner />}
    />
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('onStart must pass the adUnit and some convenience methods', () => new Promise((resolve, reject) => {
  expect.assertions = 8;

  const onStart = ({adUnit, changeVolume, pause, resume}) => {
    try {
      expect(adUnit).toBe(mockAdUnit);
      expect(adUnit.changeVolume).toHaveBeenCalledTimes(0);
      expect(adUnit.pause).toHaveBeenCalledTimes(0);
      expect(adUnit.resume).toHaveBeenCalledTimes(0);

      changeVolume();

      expect(adUnit.changeVolume).toHaveBeenCalledTimes(1);

      pause();

      expect(adUnit.pause).toHaveBeenCalledTimes(1);

      resume();

      expect(adUnit.resume).toHaveBeenCalledTimes(1);

      resolve();
    } catch (error) {
      reject(error);
    }
  };

  mount(
    <div>
      <VideoAd
        getTag={getTag}
        onStart={onStart}
        renderLoading={() => <Spinner />}
      />
    </div>
  );
}));

test('must call onError error when an adUnit has an error', () => new Promise((resolve, reject) => {
  expect.assertions = 4;
  // eslint-disable-next-line prefer-const
  const onError = jest.fn();

  const onStart = () => {
    try {
      const error = new Error('boom');
      const simulateError = mockAdUnit.onError.mock.calls[0][0];

      expect(onError).toHaveBeenCalledTimes(0);
      expect(mockAdUnit.onError).toHaveBeenCalledTimes(1);
      simulateError(error);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error);
    } catch (error) {
      reject(error);
    }

    resolve();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onError={onError}
      onStart={onStart}
      renderLoading={() => <Spinner />}
    />
  </div>);
}));

test('must resize the adUnit if the width or the height of the component changes', () => {
  expect.assertions = 2;

  const wrapper = mount(
    <VideoAd
      getTag={getTag}
      height={10}
      renderLoading={() => <Spinner />}
      width={20}
    />);

  expect(wrapper.find('div').first().props().style).toMatchObject({
    height: 10,
    width: 20
  });
});

test('must cancel the adUnit on unmount', (done) => {
  expect.assertions = 2;
  // eslint-disable-next-line prefer-const
  let wrapper;

  mockAdUnit.cancel = jest.fn();

  mockAdUnit.isFinished.mockImplementation(() => false);
  const onStart = () => {
    expect(mockAdUnit.cancel.mock.calls.length).toBe(0);
    wrapper.unmount();
    setImmediate(() => {
      expect(mockAdUnit.cancel.mock.calls.length).toBe(1);
      done();
    });
  };

  wrapper = mount(<div>
    <VideoAd
      getTag={getTag}
      onStart={onStart}
      renderLoading={() => <Spinner />}
    />
  </div>);
});

test('must not cancel the ad unit on unmount if the adUnit has already finished', (done) => {
  expect.assertions = 3;
  // eslint-disable-next-line prefer-const
  let wrapper;

  // eslint-disable-next-line no-shadow
  const mockAdUnit = {
    cancel: jest.fn(),
    changeVolume: jest.fn(),
    isFinished: jest.fn(),
    onComplete: jest.fn(),
    onError: jest.fn(),
    pause: jest.fn(),
    resize: jest.fn(),
    resume: jest.fn()
  };

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
      renderLoading={() => <Spinner />}
    />
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must call onComplete once the adUnit is finished', () => new Promise((resolve, reject) => {
  // eslint-disable-next-line prefer-const
  const onComplete = jest.fn();

  const onStart = () => {
    try {
      expect(mockAdUnit.onComplete).toHaveBeenCalledTimes(1);
    } catch (error) {
      reject(error);
    }

    resolve();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onComplete={onComplete}
      onStart={onStart}
      renderLoading={() => <Spinner />}
    />
  </div>);
}));

test('must call onError error if there is a problem starting the ad', (done) => {
  expect.assertions = 1;

  const error = new Error('boom');

  tryToStartAd.mockImplementation(() => {
    throw error;
  });
  // eslint-disable-next-line prefer-const
  const onError = (err) => {
    expect(err).toBe(error);
    done();
  };

  mount(<div>
    <VideoAd
      getTag={getTag}
      onError={onError}
      renderLoading={() => <Spinner />}
    />
  </div>);
});
