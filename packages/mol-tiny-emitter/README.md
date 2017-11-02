# mol-tiny-emitter

> Super tiny implementation of nodejs EventEmitter's `on`, `removeListener`, `removeAllListeners`, `once` and `emit` methods.
  You are probably asking yourself why the did we not use tiny-emitter or
  event-emitter or event-emitter2. Well those modules emit the events synchronously
  without a try catch so if a handler throws an error all the other handlers will also fail.

## See also
* [Root README](../../README.md)