// eslint-disable-next-line import/no-unassigned-import

const noop = () => {};

// JSDOM throws a 'Not implemented' error if you call this methods
HTMLMediaElement.prototype.play = noop;
HTMLMediaElement.prototype.pause = noop;
