import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import MolVideoAd from '../src/VideoAd';
import tryToStartAd from '../src/helpers/tryToStartAd';

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

const Spinner = () => <div className='spinner' />;

Enzyme.configure({adapter: new Adapter()});

jest.mock('../src/helpers/tryToStartAd', () => jest.fn());

const getTag = () => 'http://fakeTestTagUrl';

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
  tryToStartAd.mockImplementation(() => Promise.resolve(mockAdUnit));
});

test('must display the children until it is ready to start the ad', (done) => {
  expect.assertions = 2;
  // eslint-disable-next-line prefer-const
  let wrapper;

  const onStart = () => {
    expect(wrapper.html().includes('spinner')).toBe(false);

    done();
  };

  wrapper = mount(<div>
    <MolVideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('onStart must pass the adUnit and some convinience methods', (done) => {
  expect.assertions = 8;

  const onStart = ({adUnit, changeVolume, pause, resume}) => {
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
    done();
  };

  const wrapper = mount(<div>
    <MolVideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must call onNonRecoberable error when an adUnit has an error', (done) => {
  expect.assertions = 4;
  // eslint-disable-next-line prefer-const
  const onNonRecoverableError = jest.fn();

  const onStart = () => {
    const error = new Error('boom');
    const simulateError = mockAdUnit.onError.mock.calls[0][0];

    expect(onNonRecoverableError).toHaveBeenCalledTimes(0);
    expect(mockAdUnit.onError).toHaveBeenCalledTimes(1);
    simulateError(error);
    expect(onNonRecoverableError).toHaveBeenCalledTimes(1);
    expect(onNonRecoverableError).toHaveBeenCalledWith(error);

    done();
  };

  mount(<div>
    <MolVideoAd
      getTag={getTag}
      onNonRecoverableError={onNonRecoverableError}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);
});

test('must resize the adUnit if the width or the height of the component changes', () => {
  expect.assertions = 2;

  const wrapper = mount(
    <MolVideoAd
      getTag={getTag}
      height={10}
      width={20}
    >
      <Spinner />
    </MolVideoAd>);

  expect(wrapper.html()).toBe('<div style="height: 10px; width: 20px;"><div class="spinner"></div><div style="display: none;"></div></div>');
  wrapper.setProps({
    height: null,
    width: null
  });
  expect(wrapper.html()).toBe('<div style="height: 100%; width: 100%;"><div class="spinner"></div><div style="display: none;"></div></div>');
});

test('must on unmount cancel the adUnit', (done) => {
  expect.assertions = 3;
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

    // expect(mockAdUnit.cancel).toHaveBeenCalledTimes(1);
  };

  wrapper = mount(<div>
    <MolVideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must not cancel the ad unit on unmount if the adUnit has already finished', (done) => {
  expect.assertions = 3;
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

    // expect(mockAdUnit.cancel).toHaveBeenCalledTimes(1);
  };

  wrapper = mount(<div>
    <MolVideoAd
      getTag={getTag}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);

  expect(wrapper.html().includes('spinner')).toBe(true);
});

test('must call onComplete once the adUnit is finished', (done) => {
  expect.assertions = 4;
  // eslint-disable-next-line prefer-const
  const onComplete = jest.fn();

  const onStart = () => {
    const simulateComplete = mockAdUnit.onComplete.mock.calls[0][0];

    expect(mockAdUnit.onComplete).toHaveBeenCalledTimes(1);
    simulateComplete();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith();

    done();
  };

  mount(<div>
    <MolVideoAd
      getTag={getTag}
      onComplete={onComplete}
      onStart={onStart}
    >
      <Spinner />
    </MolVideoAd>
  </div>);
});

test('must call onNonRecoberable error if there is a problem starting the ad', (done) => {
  expect.assertions = 1;

  const error = new Error('boom');

  tryToStartAd.mockImplementation(() => {
    throw error;
  });
  // eslint-disable-next-line prefer-const
  const onNonRecoverableError = (err) => {
    expect(err).toBe(error);
    done();
  };

  mount(<div>
    <MolVideoAd
      getTag={getTag}
      onNonRecoverableError={onNonRecoverableError}
    >
      <Spinner />
    </MolVideoAd>
  </div>);
});
