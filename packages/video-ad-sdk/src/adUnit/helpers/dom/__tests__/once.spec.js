import once from '../once';

test('once must exec the listener once when the event occurs on the passed element', () => {
  const element = document.createElement('DIV');
  const listener = jest.fn();
  const eventName = 'test';

  once(element, eventName, listener);

  expect(listener).not.toHaveBeenCalled();

  element.dispatchEvent(new Event(eventName));

  expect(listener).toHaveBeenCalledTimes(1);

  element.dispatchEvent(new Event(eventName));

  expect(listener).toHaveBeenCalledTimes(1);
});

test('once must call the listener with all the args', () => {
  const element = document.createElement('DIV');
  const listener = jest.fn();
  const eventName = 'test';
  const event = new Event(eventName);

  once(element, eventName, listener);

  element.dispatchEvent(event);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(event);
});

test('once must return a remove function', () => {
  const element = document.createElement('DIV');
  const listener = jest.fn();
  const eventName = 'test';

  const disconnect = once(element, eventName, listener);

  disconnect();

  element.dispatchEvent(new Event(eventName));
  element.dispatchEvent(new Event(eventName));

  expect(listener).toHaveBeenCalledTimes(0);
});
