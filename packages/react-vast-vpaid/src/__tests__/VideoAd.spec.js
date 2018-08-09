// eslint-disable-next-line import/no-extraneous-dependencies
import {mount} from 'enzyme';
import React from 'react';
import {runWaterfall} from '@mailonline/video-ad-sdk';
import VideoAd from '../VideoAd';

const mockAdUnit = {
  cancel: jest.fn(),
  isFinished: jest.fn(),
  onError: jest.fn(),
  onRunFinish: jest.fn(),
  pause: jest.fn(),
  resize: jest.fn(),
  resume: jest.fn(),
  setVolume: jest.fn()
};

const Spinner = () => <div className='spinner' />;

jest.mock('@mailonline/video-ad-sdk', () => ({runWaterfall: jest.fn()}));

const getTag = () => 'http://fakeTestTagUrl';

describe('videoAd', () => {
  let cancelAdRun;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();

    cancelAdRun = jest.fn();
    runWaterfall.mockImplementation((adTag, placeholder, {onAdStart}) => {
      onAdStart(mockAdUnit);

      return cancelAdRun;
    });
  });

  test('must display the children until it is ready to start the ad', (done) => {
    expect.assertions(2);
    // eslint-disable-next-line prefer-const
    let wrapper;

    const onAdStart = () => {
      expect(wrapper.html().includes('spinner')).toBe(false);

      done();
    };

    wrapper = mount(<div>
      <VideoAd
        getTag={getTag}
        onAdStart={onAdStart}
      >
        <Spinner />
      </VideoAd>
    </div>);

    expect(wrapper.html().includes('spinner')).toBe(true);
  });

  test('onAdStart must handler must be called with the adUnit', (done) => {
    expect.assertions(2);

    const onAdStart = (adUnit) => {
      expect(adUnit).toBe(mockAdUnit);
      done();
    };

    const wrapper = mount(<div>
      <VideoAd
        getTag={getTag}
        onAdStart={onAdStart}
      >
        <Spinner />
      </VideoAd>
    </div>);

    expect(wrapper.html().includes('spinner')).toBe(true);
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

  test('must on `unmount` cancel the ad run', (done) => {
    expect.assertions(3);
    // eslint-disable-next-line prefer-const
    let wrapper;

    mockAdUnit.isFinished.mockImplementation(() => false);
    const onAdStart = () => {
      expect(cancelAdRun).toHaveBeenCalledTimes(0);
      wrapper.unmount();
      process.nextTick(() => {
        expect(cancelAdRun).toHaveBeenCalledTimes(1);
        done();
      });
    };

    wrapper = mount(<div>
      <VideoAd
        getTag={getTag}
        onAdStart={onAdStart}
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
    const onAdStart = () => {
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
        onAdStart={onAdStart}
      >
        <Spinner />
      </VideoAd>
    </div>);

    expect(wrapper.html().includes('spinner')).toBe(true);
  });

  test('must call onError if there is a problem starting the ad', (done) => {
    expect.assertions(1);

    const error = new Error('boom');

    runWaterfall.mockImplementation(() => {
      throw error;
    });
    const onError = (err) => {
      expect(err).toEqual(error);
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
});
