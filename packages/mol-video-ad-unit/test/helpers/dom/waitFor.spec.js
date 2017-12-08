import waitFor from '../../../src/helpers/dom/waitFor';

test('waitFor promise must resolve once the event occurs on the passed element', () => {
  const element = document.createElement('DIV');
  const eventName = 'test';
  const event = new Event(eventName);

  element.dispatchEvent(event);

  expect(waitFor(element, eventName).promise).resolves.toEqual([
    event
  ]);
});

test('waitFor cancel must reject the promise', () => {
  const element = document.createElement('DIV');
  const eventName = 'test';
  const event = new Event(eventName);

  const {
    cancel,
    promise
  } = waitFor(element, eventName);

  cancel();
  element.dispatchEvent(event);

  expect(promise).rejects.toBeInstanceOf(Error);
});
