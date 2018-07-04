import Emitter from '../index';

test('Emitter `on` method must register the listener to the passed eventName', () => {
  const emitter = new Emitter();
  const listener = function () {};

  emitter.on('bla', listener);

  expect(emitter.evts.bla[0]).toBe(listener);
});

test('Emitter `on` method must return this', () => {
  const emitter = new Emitter();
  const listener = function () {};

  expect(emitter.on('bla', listener)).toBe(emitter);
});

test('Emitter `removeListener` method must remove a previosly registered listener', () => {
  const emitter = new Emitter();
  const listener = function () {};

  emitter.on('bla', listener);
  emitter.removeListener('bla', listener);

  expect(emitter.evts.bla.length).toBe(0);
});

test('Emitter `removeListener` method must do nothing if the listener was not registered', () => {
  const emitter = new Emitter();
  const listener = function () {};

  emitter.removeListener('bla', listener);

  expect(emitter.evts.bla.length).toBe(0);
});

test('Emitter `removeListener` method must return this', () => {
  const emitter = new Emitter();
  const listener = function () {};

  expect(emitter.removeListener('bla', listener)).toBe(emitter);
});

test('Emitter `removeAllListeners` method must remove all listeners', () => {
  const emitter = new Emitter();
  const listener = function () {};

  emitter.on('ble', listener);
  emitter.on('bla', listener);
  emitter.on('bla', listener);

  expect(emitter.evts.ble.length).toBe(1);
  expect(emitter.evts.bla.length).toBe(2);

  emitter.removeAllListeners();

  expect(emitter.evts).toEqual({});
});

test('Emitter `removeAllListeners` method must remove all the listeners of the provided eventName', () => {
  const emitter = new Emitter();
  const listener = function () {};

  emitter.on('ble', listener);
  emitter.on('bla', listener);
  emitter.on('bla', listener);

  expect(emitter.evts.ble.length).toBe(1);
  expect(emitter.evts.bla.length).toBe(2);

  emitter.removeAllListeners('bla');

  expect(emitter.evts.ble.length).toBe(1);
  expect(emitter.evts.bla).toEqual(null);
});

test('Emitter `removeAllListeners` method must return this', () => {
  const emitter = new Emitter();

  expect(emitter.removeAllListeners()).toBe(emitter);
});

test('Emitter `once` method must execute the passed listener once', () => {
  const emitter = new Emitter();
  const listener = jest.fn();

  emitter.once('bla', listener);
  emitter.emit('bla', 1, 2, 3);
  emitter.emit('bla');

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).lastCalledWith(1, 2, 3);
});

test('Emitter `once` method must return this', () => {
  const emitter = new Emitter();
  const listener = function () {};

  expect(emitter.once('bla', listener)).toBe(emitter);
});

test('Emitter `emit` method must call all the prevously registered listeners with the passed args', () => {
  const emitter = new Emitter();
  const listener = jest.fn();
  const listener2 = jest.fn();

  emitter.on('bla', listener);
  emitter.on('bla', listener2);
  emitter.emit('bla', 1, 2, 3);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).lastCalledWith(1, 2, 3);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).lastCalledWith(1, 2, 3);
});

test('Emitter `emit` method must still call all the listeners if a listener throws an exception', () => {
  const emitter = new Emitter({error: () => {}});
  const listener = function () {
    throw new Error('BOOOM!!');
  };
  const listener2 = jest.fn();

  emitter.on('bla', listener);
  emitter.on('bla', listener2);
  emitter.emit('bla', 1, 2, 3);

  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).lastCalledWith(1, 2, 3);
});

test('Emitter `emit` method must return false if there were no listeners', () => {
  const emitter = new Emitter();

  expect(emitter.emit('bla')).toBe(false);
});

test('Emitter `emit` method must return true if there were listeners', () => {
  const emitter = new Emitter();

  emitter.on('bla', () => {});
  expect(emitter.emit('bla')).toBe(true);
});
